document.addEventListener('DOMContentLoaded', function () {
    const supabaseUrl = 'https://kywwztxxglpsztszujyd.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d3d6dHh4Z2xwc3p0c3p1anlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU3NTUsImV4cCI6MjA3Mzg4MTc1NX0.otzQH3CBar6HfDgfr52R2-RJa5AI2MUNzj8Y7ENEn5k';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    function formatCPF(input) {
        let value = input.value.replace(/\D/g, '');

        if (value.length > 11) {
            value = value.slice(0, 11);
        }

        if (value.length > 9) {
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (value.length > 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        } else if (value.length > 3) {
            value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        }

        input.value = value;
    }

    document.getElementById('cpf').addEventListener('input', function () {
        formatCPF(this);
    });

    function showNotification(title, message, type = 'info') {
        const notificationContainer = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';

        notification.innerHTML = `
                <i class="fas fa-${icon}"></i>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times">x</i>
                </button>
                <div class="notification-progress">
                    <div class="notification-progress-bar"></div>
                </div>
            `;

        notificationContainer.appendChild(notification);

        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                notificationContainer.removeChild(notification);
            }, 300);
        });

        setTimeout(() => {
            if (notification.parentNode === notificationContainer) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => {
                    notificationContainer.removeChild(notification);
                }, 300);
            }
        }, 5000);
    }

    // Processamento do formulário
    document.getElementById('pesquisa').addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!this.checkValidity()) {
            event.stopPropagation();
            this.classList.add('was-validated');
            showNotification('Formulário Incompleto', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }

        const formData = new FormData(this);
        const pesquisa = {
            nome: formData.get('nome'),
            cpf: formData.get('cpf').replace(/\D/g, ''),
            nivel_satisfacao: parseInt(formData.get('nivel_satisfacao')),
            comentario: formData.get('comentario') || null,
            data: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase
                .from('pesquisas')
                .insert([pesquisa]);

            if (error) {
                throw error;
            }

            showNotification('Sucesso!', 'Pesquisa enviada com sucesso!', 'success');
            this.reset();
            this.classList.remove('was-validated');
        } catch (error) {
            console.error('Erro ao enviar:', error);
            showNotification('Erro', 'Ocorreu um erro ao enviar a pesquisa: ' + error.message, 'error');
        }
    });


    const style = document.createElement('style');
    style.textContent = `
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
});