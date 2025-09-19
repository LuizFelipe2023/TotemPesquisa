const supabaseUrl = 'https://kywwztxxglpsztszujyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d3d6dHh4Z2xwc3p0c3p1anlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3NTUsImV4cCI6MjA3Mzg4MTc1NX0.otzQH3CBar6HfDgfr52R2-RJa5AI2MUNzj8Y7ENEn5k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Erro: ' + error.message);
        return;
    }

    localStorage.setItem('supabaseSession', JSON.stringify(data.session));
    window.location.href = 'visualizarPesquisas.html';
});
