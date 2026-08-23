(() => {
  const form = document.querySelector('[data-login-form]');
  const message = document.querySelector('[data-login-message]');
  const submit = document.querySelector('[data-login-submit]');
  const password = form?.elements.password;

  function showMessage(text, type = 'error') {
    message.textContent = text;
    message.dataset.type = type;
    message.hidden = !text;
  }

  async function checkExistingSession() {
    try {
      const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
      if (response.ok) window.location.replace('/gestor/');
    } catch (_) { /* The form remains usable when the preflight check fails. */ }
  }

  document.querySelector('[data-toggle-password]')?.addEventListener('click', (event) => {
    const visible = password.type === 'text';
    password.type = visible ? 'password' : 'text';
    event.currentTarget.textContent = visible ? 'Ver' : 'Ocultar';
    event.currentTarget.setAttribute('aria-label', visible ? 'Mostrar senha' : 'Ocultar senha');
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage('');
    if (!form.reportValidity()) return;
    submit.disabled = true;
    submit.innerHTML = 'Verificando…';
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.elements.username.value, password: password.value })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (payload.code === 'PASS_EXPIRED') showMessage('Seu passe expirou. Peça a renovação para recuperar o acesso.');
        else if (payload.code === 'TOO_MANY_ATTEMPTS') showMessage('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        else showMessage(payload.message || 'Não foi possível entrar. Confira o usuário e a senha.');
        return;
      }
      showMessage('Acesso confirmado. Abrindo sua gestão…', 'success');
      window.location.replace('/gestor/');
    } catch (_) {
      showMessage('Não foi possível conectar agora. Verifique sua internet e tente novamente.');
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Entrar na gestão <span aria-hidden="true">→</span>';
    }
  });

  if (new URLSearchParams(window.location.search).get('estado') === 'expirado') {
    showMessage('Este passe não está ativo. Entre novamente após a renovação.');
  }
  checkExistingSession();
})();
