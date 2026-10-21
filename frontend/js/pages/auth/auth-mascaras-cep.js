/**
 * ITAIM VENDE - AUTENTICAÇÃO: MÓDULO DE CEP E MÁSCARAS
 * Arquivo: frontend/js/pages/auth/auth-mascaras-cep.js
 * 
 * Gerencia preenchimento automático por CEP (ViaCEP + BrasilAPI fallback) e
 * máscaras de entrada para CEP, Telefone/WhatsApp, Username e OTP.
 */

(function (window, document) {
    'use strict';

    let timerConsultaCep = null;

    window.ItaimAuthMascarasCep = {
        consultarCepEPreencher: async function (inputCep) {
            if (!inputCep) return;
            const form = inputCep.closest('form') || document;
            const cepLimpo = inputCep.value.replace(/\D/g, '');

            if (cepLimpo.length !== 8) return;

            const campoCidade = form.querySelector('#cad-cidade');
            const campoEstado = form.querySelector('#cad-estado');
            const campoBairro = form.querySelector('#cad-bairro');
            const statusMsg = document.getElementById('status-msg-cadastro');

            inputCep.classList.add('buscando-cep');

            try {
                let dados = null;

                // 1. Tenta ViaCEP
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                    if (res.ok) {
                        const json = await res.json();
                        if (!json.erro) {
                            dados = {
                                cidade: json.localidade || '',
                                estado: json.uf || '',
                                bairro: json.bairro || '',
                                logradouro: json.logradouro || ''
                            };
                        }
                    }
                } catch (e1) {
                    // Fallback para BrasilAPI
                    try {
                        const res2 = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
                        if (res2.ok) {
                            const json2 = await res2.json();
                            dados = {
                                cidade: json2.city || '',
                                estado: json2.state || '',
                                bairro: json2.neighborhood || '',
                                logradouro: json2.street || ''
                            };
                        }
                    } catch (e2) {}
                }

                if (dados && dados.cidade) {
                    // Preenche Cidade
                    if (campoCidade) {
                        if (campoCidade.tagName.toLowerCase() === 'select') {
                            let encontrou = false;
                            for (let i = 0; i < campoCidade.options.length; i++) {
                                const opt = campoCidade.options[i];
                                if (opt.value.toLowerCase() === dados.cidade.toLowerCase() ||
                                    opt.text.toLowerCase() === dados.cidade.toLowerCase()) {
                                    campoCidade.selectedIndex = i;
                                    encontrou = true;
                                    break;
                                }
                            }
                            if (!encontrou) {
                                const novaOpt = document.createElement('option');
                                novaOpt.value = dados.cidade;
                                novaOpt.textContent = dados.cidade;
                                novaOpt.selected = true;
                                campoCidade.appendChild(novaOpt);
                            }
                        } else {
                            campoCidade.value = dados.cidade;
                        }
                        campoCidade.classList.add('campo-autocompletado');
                        setTimeout(() => campoCidade.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Preenche Estado
                    if (campoEstado) {
                        campoEstado.value = dados.estado.toUpperCase();
                        campoEstado.classList.add('campo-autocompletado');
                        setTimeout(() => campoEstado.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Preenche Bairro se fornecido
                    if (campoBairro && dados.bairro && !campoBairro.value.trim()) {
                        campoBairro.value = dados.bairro;
                        campoBairro.classList.add('campo-autocompletado');
                        setTimeout(() => campoBairro.classList.remove('campo-autocompletado'), 1800);
                    }

                    // Remove avisos de erro e adiciona destaque de sucesso
                    inputCep.classList.remove('com-erro');
                    if (statusMsg && statusMsg.classList.contains('status-erro')) {
                        statusMsg.textContent = '';
                        statusMsg.className = 'status-msg';
                    }

                    inputCep.classList.add('campo-sucesso');
                    setTimeout(() => inputCep.classList.remove('campo-sucesso'), 1800);

                    // Foca suavemente no próximo campo
                    if (campoBairro && !campoBairro.value.trim()) {
                        campoBairro.focus();
                    }
                } else {
                    if (statusMsg && !statusMsg.textContent) {
                        statusMsg.textContent = 'CEP não localizado automaticamente. Preencha a cidade e o estado manualmente.';
                        statusMsg.className = 'status-msg status-info';
                        setTimeout(() => {
                            if (statusMsg.className.includes('status-info')) {
                                statusMsg.textContent = '';
                                statusMsg.className = 'status-msg';
                            }
                        }, 4000);
                    }
                }
            } catch (err) {
                console.warn('[CEP] Erro ao consultar CEP:', err);
            } finally {
                inputCep.classList.remove('buscando-cep');
            }
        },

        inicializar: function () {
            const self = this;

            // Máscara e consulta de CEP
            document.querySelectorAll('#cad-cep').forEach(input => {
                input.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').substring(0, 8);
                    if (v.length > 5) v = v.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
                    e.target.value = v;

                    const cepNumeros = v.replace(/\D/g, '');
                    if (cepNumeros.length === 8) {
                        clearTimeout(timerConsultaCep);
                        timerConsultaCep = setTimeout(() => {
                            self.consultarCepEPreencher(e.target);
                        }, 150);
                    }
                });

                input.addEventListener('blur', (e) => {
                    const cepNumeros = e.target.value.replace(/\D/g, '');
                    if (cepNumeros.length === 8) {
                        self.consultarCepEPreencher(e.target);
                    }
                });
            });

            // Máscara de Telefone / WhatsApp
            document.querySelectorAll('#cad-telefone').forEach(input => {
                input.addEventListener('input', (e) => {
                    let v = e.target.value.replace(/\D/g, '').substring(0, 11);
                    if (v.length > 6) {
                        v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                    } else if (v.length > 2) {
                        v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                    } else if (v.length > 0) {
                        v = v.replace(/^(\d{0,2})/, '($1');
                    }
                    e.target.value = v;
                });
            });

            // Higienização de Username
            document.querySelectorAll('#cad-username').forEach(input => {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase();
                });
            });

            // Higienização de Código OTP
            document.querySelectorAll('#recuperar-codigo').forEach(input => {
                input.addEventListener('input', (e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
                });
            });
        }
    };

})(window, document);
