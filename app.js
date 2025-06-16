// Chaves de dados para armazenamento
const USERS_KEY = 'towertask-users';
const SESSION_USER_KEY = 'towertask-session-user';
const TASKS_KEY = 'towertask-tasks';

// Estado na memória
let users = [];
let currentUser = null;
let tasks = [];

const authSection = document.getElementById('auth-section');
const appContainer = document.getElementById('app-container');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const usernameInput = document.getElementById('auth-username');
const passwordInput = document.getElementById('auth-password');
const roleSelect = document.getElementById('auth-role');
const roleLabel = document.getElementById('role-label');
const authSwitch = document.getElementById('auth-switch');
const authSubmitButton = document.getElementById('auth-submit');
const authMessage = document.getElementById('auth-message');

const logoutBtnContainer = document.createElement('div');
logoutBtnContainer.id = 'auth-info';

const addTaskForm = document.getElementById('new-task-form');
const newTaskTitle = document.getElementById('new-task-title');
const newTaskDesc = document.getElementById('new-task-desc');
const newTaskPriority = document.getElementById('new-task-priority');
const newTaskAssignee = document.getElementById('new-task-assignee');
const newTaskStatus = document.getElementById('new-task-status');
const addTaskBtn = document.getElementById('add-task-btn');

const columns = {
    'todo': document.getElementById('todo-list'),
    'in-progress': document.getElementById('in-progress-list'),
    'done': document.getElementById('done-list')
};

const taskFilterSelect = document.getElementById('task-filter');

const notificationContainer = document.getElementById('notification-container');

// Funções de utilidade
// Salvar/carregar usuários
function loadUsers() {
    try {
		return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
		} catch {
		return [];
	}
}
function saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Salvar/carregar tarefas
function loadTasks() {
    try {
		return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
		} catch {
		return [];
	}
}
function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// Salvar/carregar sessão do usuário
function loadSessionUser() {
    try {
		const user = JSON.parse(localStorage.getItem(SESSION_USER_KEY));
		if (user && user.username) return user;
		return null;
		} catch {
		return null;
	}
}
function saveSessionUser(user) {
    localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}
function clearSessionUser() {
    localStorage.removeItem(SESSION_USER_KEY);
}

// senha hash com SHA-256 (assíncrono)
async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Exibir notificação do sistema
function showNotification(message, timeout = 4000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('tabindex', '0');
    toast.innerHTML = `${message} <span class="material-icons" aria-hidden="true">close</span>`;
    notificationContainer.appendChild(toast);
    toast.focus();
    function removeToast() {
		toast.remove();
	}
    toast.addEventListener('click', removeToast);
    // Descartar na tecla Escape
    toast.addEventListener('keydown', e => {
		if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			removeToast();
		}
	});
    setTimeout(removeToast, timeout);
}

// Limpar mensagem de autenticação
function clearAuthMessage() {
    authMessage.textContent = '';
}

// Validar nome de usuário
function isValidUsername(username) {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

// Validar comprimento da senha
function isValidPassword(password) {
    return password.length >= 8;
}

// Crie um contorno visível e com foco acessível para elementos dinâmicos, conforme necessário
function addFocusVisibleOutline(el) {
    el.addEventListener('focus', () => {
		el.style.outline = '3px solid #2563eb';
		el.style.outlineOffset = '2px';
	});
    el.addEventListener('blur', () => {
		el.style.outline = 'none';
	});
}

// Autenticação

let isRegisterMode = false;

// Alternar formulário entre login/registro
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    authTitle.textContent = isRegisterMode ? 'Registrar' : 'Conecte-se';
    authSubmitButton.textContent = isRegisterMode ? 'Registrar' : 'Conecte-se';
    authSwitch.textContent = isRegisterMode ? 'Já tem uma conta? Entrar' : "Não tem uma conta? Cadastre-se";
    authSwitch.setAttribute('aria-pressed', isRegisterMode.toString());
    clearAuthMessage();
    if (isRegisterMode) {
		roleSelect.classList.remove('hidden');
		roleLabel.classList.remove('hidden');
		} else {
		roleSelect.classList.add('hidden');
		roleLabel.classList.add('hidden');
	}
}

// Registrar novo usuário
async function registerUser(username, password, role) {
    username = username.trim();
    if (!isValidUsername(username)) {
		throw new Error('O nome de usuário deve ter de 3 a 20 caracteres (letras, dígitos, sublinhados).');
	}
    if (!isValidPassword(password)) {
		throw new Error('A senha deve ter pelo menos 8 caracteres.');
	}
    if (!['member', 'admin'].includes(role)) {
		throw new Error('Seleção de função inválida.');
	}
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
		throw new Error('O nome de usuário já existe.');
	}
    const hashed = await sha256(password);
    const newUser = {
		id: Date.now().toString(),
		username,
		password: hashed,
		role,
		createdAt: Date.now()
	};
    users.push(newUser);
    saveUsers();
    return newUser;
}

// Validação de entrada de usuário
async function loginUser(username, password) {
    username = username.trim();
    if (!username || !password) {
		throw new Error('Forneça nome de usuário e senha.');
	}
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
		throw new Error('Usuário não encontrado.');
	}
    const hashed = await sha256(password);
    if (hashed !== user.password) {
		throw new Error('Senha incorreta.');
	}
    return user;
}

// Usuário sendo desconectado
function logout() {
    currentUser = null;
    clearSessionUser();
    appContainer.classList.add('hidden');
    authSection.classList.remove('hidden');
    renderAuthInfo();
    showNotification('Desconectado.');
}

// Render user info and logout btn in header
function renderAuthInfo() {
    const authInfoContainer = document.getElementById('auth-info') || document.createElement('div');
    if (currentUser) {
		authInfoContainer.innerHTML = `
        <span aria-live="polite">Bem-vindo(a), <strong>${escapeHTML(currentUser.username)}.</strong></span>
        <span id="user-role" aria-label="User role">! Perfil: <strong>${currentUser.role.toUpperCase()}</strong></span>
        <button id="logout-btn" aria-label="Logout from account">Sair</button>
		`;
		authInfoContainer.style.display = 'flex';
		authInfoContainer.style.alignItems = 'center';
		document.querySelector('header').appendChild(authInfoContainer);
		document.getElementById('logout-btn').onclick = () => logout();
		} else {
		authInfoContainer.innerHTML = '';
		authInfoContainer.style.display = 'none';
	}
}

// Tarefas
/* Estrutura de dados da tarefa:
	{
	id: string,
	title: string,
	description: string|null,
	priority: "low"|"medium"|"high",
	status: "todo"|"in-progress"|"done",
	assignee: username string,
	createdAt: timestamp
}*/

// Renderizar tarefas em colunas com base no status e no filtro atual
function renderTasks(filter='all') {
    // Limpar todas as colunas
    Object.values(columns).forEach(col => col.innerHTML = '');
    let filtered = tasks.filter(task => {
		if (filter === 'all') return true;
		if(['todo', 'in-progress', 'done'].includes(filter)) {
			return task.status === filter;
		}
		// caso contrário, filtre pelo nome de usuário do responsável
		return task.assignee === filter;
	});
    if (filtered.length === 0) {
		Object.values(columns).forEach(col => col.innerHTML = '<p style="color:#64748b; font-size:0.9rem; text-align:center; margin-top:12px;">Nenhuma tarefa encontrada.</p>');
		return;
	}
    filtered.forEach(task => {
		const container = columns[task.status];
		const taskCard = document.createElement('article');
		taskCard.className = 'task-card';
		taskCard.setAttribute('tabindex', '0');
		taskCard.setAttribute('role', 'listitem');
		taskCard.draggable = currentUser.role === 'admin' || currentUser.username === task.assignee; // somente autor/administrador pode arrastar
		
		// Etiquetas ARIA com informações de tarefas
		taskCard.setAttribute('aria-label', `Tarefa intitulada ${task.title}, prioridade ${task.priority}, atribuído a ${task.assignee}`);
		
		// Título da tarefa + botão de exclusão para administradores ou responsáveis
		const titleSpan = document.createElement('div');
		titleSpan.className = 'task-title';
		titleSpan.textContent = task.title;
		
		const deleteBtn = document.createElement('button');
		deleteBtn.className = 'task-delete-btn';
		deleteBtn.setAttribute('aria-label', `Excluir tarefa intitulada ${task.title}`);
		deleteBtn.innerHTML = '<span class="material-icons">delete_forever</span>';
		// Mostrar botão de exclusão somente se o usuário for administrador ou usuário atribuído
		if(currentUser.role === 'admin' || currentUser.username === task.assignee) {
			deleteBtn.style.display = 'inline-block';
			deleteBtn.onclick = (e) => {
				e.stopPropagation();
				if(confirm(`Excluir tarefa "${task.title}"?`)) {
					deleteTask(task.id);
				}
			}
			} else {
			deleteBtn.style.display = 'none';
		}
		
		// Cabeçalho da tarefa: título + excluir
		const headerDiv = document.createElement('div');
		headerDiv.style.display = 'flex';
		headerDiv.style.justifyContent = 'space-between';
		headerDiv.style.alignItems = 'center';
		headerDiv.appendChild(titleSpan);
		headerDiv.appendChild(deleteBtn);
		
		// Descrição
		const descDiv = document.createElement('div');
		descDiv.textContent = task.description || '';
		descDiv.style.color = '#475569';
		descDiv.style.fontSize = '0.9rem';
		descDiv.style.fontStyle = task.description ? 'normal' : 'italic';
		
		// Metadados
		const metaDiv = document.createElement('div');
		metaDiv.className = 'task-meta';
		metaDiv.innerHTML = `
        <span>Prioridade: <strong class="priority-${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</strong></span>
        <span>Responsável: <span class="task-assignee">${task.assignee}</span></span>
		`;
		
		// Compor cartão
		taskCard.appendChild(headerDiv);
		taskCard.appendChild(descDiv);
		taskCard.appendChild(metaDiv);
		
		// Arraste eventos para reordenar ou alterar o status
		if (taskCard.draggable) {
			taskCard.addEventListener('dragstart', dragStartHandler);
		}
		
		container.appendChild(taskCard);
	});
}

// Excluir tarefa por id
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks(taskFilterSelect.value);
    showNotification('Task deleted');
}

// Adicionar nova tarefa
function addNewTask(title, description, priority, assignee, status) {
    title = title.trim();
    description = description.trim();
    assignee = assignee.trim();
    priority = priority.trim();
    status = status.trim();
    if(!title) throw new Error('O título da tarefa é obrigatório');
    if(!priority) throw new Error('A prioridade da tarefa é necessária');
    if(!assignee) throw new Error('O nome do responsável é necessário');
    if(!status) throw new Error('O status é obrigatório');
    const id = Date.now().toString() + Math.random().toString(36).substring(2,8);
    const newTask = {id, title, description, priority, assignee, status, createdAt: Date.now()};
    tasks.unshift(newTask);
    saveTasks();
    renderTasks(taskFilterSelect.value);
    showNotification(`Tarefa "${title}" adicionada`);
}

// Arrastar e soltar
let draggedTaskId = null;

function dragStartHandler(e) {
    draggedTaskId = getTaskIdFromElement(e.target);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedTaskId);
    e.target.style.opacity = '0.6';
}
// Habilitar destinos de soltar em colunas
Object.values(columns).forEach(col => {
    col.addEventListener('dragover', e => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
		col.style.backgroundColor = '#e0e7ff';
	});
    col.addEventListener('dragleave', e => {
		col.style.backgroundColor = 'transparent';
	});
    col.addEventListener('drop', e => {
		e.preventDefault();
		col.style.backgroundColor = 'transparent';
		const droppedTaskId = e.dataTransfer.getData('text/plain');
		if (droppedTaskId !== draggedTaskId) return; // verificação de sanidade
		const newStatus = getStatusFromColumn(col.id);
		// Atualizar status da tarefa para tarefa arrastada
		const taskIdx = tasks.findIndex(t => t.id === droppedTaskId);
		if (taskIdx > -1 && (currentUser.role === 'admin' || currentUser.username === tasks[taskIdx].assignee)) {
			tasks[taskIdx].status = newStatus;
			saveTasks();
			renderTasks(taskFilterSelect.value);
			showNotification(`Tarefa "${tasks[taskIdx].title}" alterada para "${capitalize(newStatus)}"`);
			// notificar outras guias
			localStorage.setItem('tasksphere-sync', Date.now());
		}
	});
});
// ao arrastar e soltar, limpe a opacidade
document.addEventListener('dragend', e => {
    if (e.target && e.target.classList.contains('task-card')) {
		e.target.style.opacity = '1';
	}
});
function getTaskIdFromElement(el) {
    if (!el) return null;
    while(el && !el.classList.contains('task-card')) {
		el = el.parentElement;
	}
    if (!el) return null;
    return tasks.find(t => {
		// Compare o título da tarefa como único para simplificar a demonstração, é melhor armazenar o ID no DOM no atributo data-id
		return t.title === el.querySelector('.task-title').textContent;
	})?.id || null;
}
function getStatusFromColumn(colId) {
    if(colId === 'todo-list') return 'todo';
    if(colId === 'in-progress-list') return 'in-progress';
    if(colId === 'done-list') return 'done';
    return 'todo';
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


// Atualizar filtro de responsáveis e selecionar opções
function updateAssigneeOptions() {
    // Obtenha nomes de usuários exclusivos de todos os usuários
    const uniqueUsers = users.map(u => u.username).sort();
    // Atualizar seleção de responsáveis (novo formulário de tarefa)
    newTaskAssignee.innerHTML = '';
    uniqueUsers.forEach(u => {
		const opt = document.createElement('option');
		opt.value = u;
		opt.textContent = u;
		newTaskAssignee.appendChild(opt);
	});
    // Atualizar grupo de opções de atribuição de filtro
    const assigneeGroup = taskFilterSelect.querySelector('optgroup[label="Assignee"]');
    assigneeGroup.innerHTML = '';
    uniqueUsers.forEach(u => {
		const opt = document.createElement('option');
		opt.value = u;
		opt.textContent = u;
		assigneeGroup.appendChild(opt);
	});
}

// Escape HTML (para prevenção de XSS)
function escapeHtml(text) {
    const p = document.createElement('p');
    p.textContent = text;
    return p.innerHTML;
}

// Escale se a filtragem de tarefas mudar
taskFilterSelect.addEventListener('change', () => {
	renderTasks(taskFilterSelect.value);
});

// Cadastro: Entrada e saída de usuários
authSwitch.addEventListener('click', () => {
	toggleAuthMode();
});
authSwitch.addEventListener('keydown', e => {
	if(e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		toggleAuthMode();
	}
});
authForm.addEventListener('submit', async e => {
	e.preventDefault();
	clearAuthMessage();
	
	const username = usernameInput.value.trim();
	const password = passwordInput.value.trim();
	const role = roleSelect.value;
	
	try {
		if(isRegisterMode) {
			/* Restringir o registro inicial apenas para usuários normais (impedir a criação de administradores via 
			interface de usuário, o administrador pode criar novos administradores internamente)*/
			if(role !== 'member') {
				throw new Error('Não é possível registrar-se como administrador. Entre em contato com o setor responsável.');
			}
			const newUser = await registerUser(username, password, role);
			currentUser = newUser;
			} else {
			const loggedUser = await loginUser(username, password);
			currentUser = loggedUser;
		}
		saveSessionUser(currentUser);
		authSection.classList.add('hidden');
		appContainer.classList.remove('hidden');
		renderAuthInfo();
		updateAssigneeOptions();
		tasks = loadTasks();
		renderTasks('all');
		// Notificação de boas-vindas
		showNotification(`Seja bem-vindo(a) ${currentUser.username}! Perfil: ${capitalize(currentUser.role)}`);
	}
	catch(err) {
		authMessage.textContent = err.message;
	}
});

// Adicionar novo evento de tarefa
addTaskForm.addEventListener('submit', e => {
	e.preventDefault();
	try {
		addNewTask(
			newTaskTitle.value,
			newTaskDesc.value,
			newTaskPriority.value,
			newTaskAssignee.value,
			newTaskStatus.value
		);
		addTaskForm.reset();
		} catch(err){
		showNotification(`Erro: ${err.message}`);
	}
});

// Sincronização de eventos de armazenamento para atualizações em tempo real em várias guias
window.addEventListener('storage', e => {
	if(e.key === TASKS_KEY) {
		tasks = loadTasks();
		if(appContainer.classList.contains('hidden')) return; // aplicativo não ativo
		renderTasks(taskFilterSelect.value);
		showNotification('Tarefas atualizadas (sincronização)');
	}
	if(e.key === USERS_KEY) {
		users = loadUsers();
		updateAssigneeOptions();
	}
});

// Escape HTML para texto
function escapeHTML(text) {
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

// Inicialização do aplicativo
function initApp() {
	users = loadUsers();
	if(users.length === 0) {
		// Crie um usuário administrador padrão no primeiro carregamento
		(async () => {
			const defaultAdmin = {
				id: '1',
				username: 'admin',
				password: await sha256('admin1234'),
				role: 'admin',
				createdAt: Date.now()
			};
			users.push(defaultAdmin);
			saveUsers();
		})();
	}
	currentUser = loadSessionUser();
	tasks = loadTasks();
	if (currentUser) {
		authSection.classList.add('hidden');
		appContainer.classList.remove('hidden');
		renderAuthInfo();
		updateAssigneeOptions();
		renderTasks('all');
		showNotification(`Bem-vindo(a) de volta, ${currentUser.username}!`);
		} else {
		appContainer.classList.add('hidden');
		authSection.classList.remove('hidden');
		roleSelect.classList.add('hidden');
		roleLabel.classList.add('hidden');
	}
}
initApp();