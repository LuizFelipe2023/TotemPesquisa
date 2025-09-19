const supabaseUrl = 'https://kywwztxxglpsztszujyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d3d6dHh4Z2xwc3p0c3p1anlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3NTUsImV4cCI6MjA3Mzg4MTc1NX0.otzQH3CBar6HfDgfr52R2-RJa5AI2MUNzj8Y7ENEn5k';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

let pesquisas = [];
let tabela;

async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = 'login.html';
        return;
    }
    console.log('Usuário logado:', data.session.user.email);
}

async function carregarPesquisas() {
    const { data, error } = await supabase
        .from('pesquisas')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        alert('Erro ao carregar pesquisas: ' + error.message);
        return;
    }

    pesquisas = data || [];

    // Atualiza contadores
    document.getElementById('totalPesquisas').innerText = pesquisas.length;
    document.getElementById('nivel1').innerText = pesquisas.filter(p => p.nivel_satisfacao === 1).length;
    document.getElementById('nivel2').innerText = pesquisas.filter(p => p.nivel_satisfacao === 2).length;
    document.getElementById('nivel45').innerText = pesquisas.filter(p => p.nivel_satisfacao >= 4).length;

    // Popula DataTable
    if ($.fn.DataTable.isDataTable('#tabelaPesquisas')) {
        tabela.clear().rows.add(pesquisas.map(p => [
            p.nome,
            p.cpf,
            p.nivel_satisfacao === 1 ? 'Muito Insatisfeito' :
            p.nivel_satisfacao === 2 ? 'Insatisfeito' :
            p.nivel_satisfacao === 3 ? 'Neutro' :
            p.nivel_satisfacao === 4 ? 'Satisfeito' :
            'Muito Satisfeito',
            p.comentario || '-',
            new Date(p.data).toLocaleString()
        ])).draw();
    } else {
        tabela = $('#tabelaPesquisas').DataTable({
            data: pesquisas.map(p => [
                p.nome,
                p.cpf,
                p.nivel_satisfacao === 1 ? 'Muito Insatisfeito' :
                p.nivel_satisfacao === 2 ? 'Insatisfeito' :
                p.nivel_satisfacao === 3 ? 'Neutro' :
                p.nivel_satisfacao === 4 ? 'Satisfeito' :
                'Muito Satisfeito',
                p.comentario || '-',
                new Date(p.data).toLocaleString()
            ]),
            columns: [
                { title: "Nome" },
                { title: "CPF" },
                { title: "Nível de Satisfação" },
                { title: "Comentário" },
                { title: "Data" }
            ],
            order: [[4, 'desc']],
            pageLength: 10
        });
    }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

document.getElementById('gerarPDF').addEventListener('click', () => {
    if (!pesquisas.length) return alert('Nenhuma pesquisa carregada!');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
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
        head: [['Nome','CPF','Nível','Comentário','Data']],
        body: rows
    });

    doc.save('pesquisas.pdf');
});


checkSession().then(() => carregarPesquisas());