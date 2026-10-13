/* Ajuda: realça o assunto aberto pelo link */
(function () {
  'use strict';
  function marca() {
    document.querySelectorAll('.ajuda-sec').forEach(s => s.classList.toggle('alvo', '#' + s.id === location.hash));
  }
  addEventListener('hashchange', marca);
  const apagar = document.getElementById('apagar-perfil');
  if (apagar) apagar.addEventListener('click', () => {
    let tinha = false;
    try { tinha = !!localStorage.getItem('cl_provador_perfil'); localStorage.removeItem('cl_provador_perfil'); } catch (e) {}
    document.getElementById('apagar-msg').textContent = tinha ? 'Perfil apagado deste navegador.' : 'Não havia perfil salvo neste navegador.';
    if (tinha && window.CL) window.CL.track('provador_profile_deleted', { origem: 'ajuda' });
  });
  marca();
})();
