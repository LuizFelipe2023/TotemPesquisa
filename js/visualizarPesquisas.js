const supabaseUrl = 'https://kywwztxxglpsztszujyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d3d6dHh4Z2xwc3p0c3p1anlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3NTUsImV4cCI6MjA3Mzg4MTc1NX0.otzQH3CBar6HfDgfr52R2-RJa5AI2MUNzj8Y7ENEn5k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const tabela = document.querySelector('#tabelaPesquisas tbody');
let pesquisas = [];

async function checkSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Erro ao verificar sessão:', error);
        alert('Erro de autenticação. Faça login novamente.');
        window.location.href = 'login.html';
        return;
    }

    const session = data.session;
    if (!session) {
        console.log('Usuário não autenticado');
        window.location.href = 'login.html';
    } else {
        console.log('Usuário logado:', session.user.email);
    }
}

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Erro ao deslogar: ' + error.message);
        return;
    }
    localStorage.removeItem('supabaseSession');
    window.location.href = 'login.html';
});

document.getElementById('carregarPesquisas').addEventListener('click', async () => {
    console.log('Tentando carregar pesquisas...');
    const { data, error } = await supabase
        .from('pesquisas')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        console.error('Erro ao carregar pesquisas:', error);
        alert('Erro ao carregar pesquisas: ' + error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Nenhuma pesquisa encontrada ou RLS bloqueando acesso');
        tabela.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma pesquisa encontrada</td></tr>';
        return;
    }

    pesquisas = data;
    tabela.innerHTML = '';

    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.nome}</td>
            <td>${p.cpf}</td>
            <td>${
                p.nivel_satisfacao === 1 ? 'Muito Insatisfeito' :
                p.nivel_satisfacao === 2 ? 'Insatisfeito' :
                p.nivel_satisfacao === 3 ? 'Neutro' :
                p.nivel_satisfacao === 4 ? 'Satisfeito' :
                'Muito Satisfeito'
            }</td>
            <td>${p.comentario || '-'}</td>
            <td>${new Date(p.data).toLocaleString()}</td>
        `;
        tabela.appendChild(tr);
    });
});

document.getElementById('gerarPDF').addEventListener('click', () => {
    if (pesquisas.length === 0) {
        alert('Nenhuma pesquisa carregada!');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Pesquisas de Satisfação', 14, 20);

    const rows = pesquisas.map(p => [
        p.nome,
        p.cpf,
        p.nivel_satisfacao === 1 ? 'Muito Insatisfeito' :
        p.nivel_satisfacao === 2 ? 'Insatisfeito' :
        p.nivel_satisfacao === 3 ? 'Neutro' :
        p.nivel_satisfacao === 4 ? 'Satisfeito' :
        'Muito Satisfeito',
        p.comentario || '-',
        new Date(p.data).toLocaleString()
    ]);

    doc.autoTable({
        startY: 30,
        head: [['Nome', 'CPF', 'Nível', 'Comentário', 'Data']],
        body: rows,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [108, 92, 231], textColor: 255, halign: 'center' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 40 }
        },
        margin: { left: 14, right: 14 },
    });

    doc.save('pesquisas.pdf');
});

// Chama verificação de sessão ao carregar a página
checkSession();
