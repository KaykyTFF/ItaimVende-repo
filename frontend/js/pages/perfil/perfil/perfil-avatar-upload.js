/**
 * ITAIM VENDE - PERFIL: UPLOAD E ALTERAÇÃO DE FOTO
 * Arquivo: frontend/js/pages/perfil/perfil/perfil-avatar-upload.js
 */

(function () {
    'use strict';

    function inicializar() {
        const { exibirToast } = window.ItaimPerfilUtils;
        const inputFotoAvatar = document.getElementById('input-foto-avatar');
        const avatarImgView = document.getElementById('perfil-avatar-view');

        if (!inputFotoAvatar || !avatarImgView) return;

        inputFotoAvatar.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const perfil = window.ItaimPerfilDados?.obterPerfil() || {};

            const salvarFoto = async (novaFoto) => {
                // Atualização visual imediata
                if (typeof novaFoto === 'string') {
                    avatarImgView.src = novaFoto;
                }

                // Upload para o backend Express / Supabase
                if (window.ItaimApi && window.ItaimApi.upload && window.ItaimApi.auth && window.ItaimApi.auth.obterToken()) {
                    try {
                        const resUpload = await window.ItaimApi.upload.perfil(novaFoto);
                        if (resUpload && resUpload.data && resUpload.data.url) {
                            const urlFotoServidor = resUpload.data.url;

                            // Atualiza a URL do avatar no PostgreSQL via PUT /api/auth/me
                            await window.ItaimApi.auth.atualizarPerfil({ avatar: urlFotoServidor });

                            // Atualiza visualização final resolvida
                            const urlResolvida = window.ItaimApi.resolverUrlImagem(urlFotoServidor);
                            avatarImgView.src = urlResolvida;

                            // Atualiza cache e Header Global
                            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                                window.ItaimSessao.atualizarDadosUsuario(perfil.email, { avatar: urlFotoServidor });
                            }
                            if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                                window.ItaimSessao.atualizarHeaderUsuario();
                            }

                            perfil.avatar = urlFotoServidor;
                            exibirToast('Foto de perfil salva com sucesso no servidor!');
                            return;
                        }
                    } catch (errUpload) {
                        console.error('[Perfil] Erro no upload da imagem:', errUpload);
                        alert('Não foi possível salvar a imagem no servidor. Verifique sua conexão.');
                    }
                } else {
                    // Sem token, salva apenas localmente
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarDadosUsuario === 'function') {
                        window.ItaimSessao.atualizarDadosUsuario(perfil.email, { avatar: novaFoto });
                    }
                    if (window.ItaimSessao && typeof window.ItaimSessao.atualizarHeaderUsuario === 'function') {
                        window.ItaimSessao.atualizarHeaderUsuario();
                    }
                    exibirToast('Foto atualizada localmente!');
                }
            };

            // Processa com corte 1:1 se a biblioteca de recorte estiver carregada
            if (window.ItaimFoto && typeof window.ItaimFoto.ajustarPerfil === 'function') {
                window.ItaimFoto.ajustarPerfil(file, salvarFoto);
            } else if (window.ItaimFoto && typeof window.ItaimFoto.ajustar === 'function') {
                window.ItaimFoto.ajustar(file, 400, salvarFoto);
            } else {
                salvarFoto(file);
            }
        });
    }

    window.ItaimPerfilAvatarUpload = {
        inicializar
    };
})();
