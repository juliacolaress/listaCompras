// Pegando os elementos do DOM
const form = document.getElementById('form');
const itemInput = document.getElementById('itemInput');
const precoInput = document.getElementById('precoInput');
const categoriaInput = document.getElementById('categoriaInput');
const lista = document.getElementById('lista');
const totalDisplay = document.getElementById('total');
const limparListaBtn = document.getElementById('limparListaBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const btnAdicionar = form.querySelector('button[type="submit"]'); // botão adicionar

// Criando parágrafo para mostrar mensagem do contador
const contadorMensagem = document.createElement('p');
contadorMensagem.style.fontStyle = 'italic';
contadorMensagem.style.color = '#555';
contadorMensagem.style.marginTop = '5px';
btnAdicionar.insertAdjacentElement('afterend', contadorMensagem);

// Variável para contador, pega do localStorage ou inicia 0
let totalCliques = parseInt(localStorage.getItem('totalCliques'), 10) || 0;

// Atualiza texto do botão e mensagem inicial
btnAdicionar.textContent = `Adicionar (${totalCliques})`;
function atualizarMensagem() {
  if (totalCliques === 0) {
    contadorMensagem.textContent = '';
  } else if (totalCliques < 5) {
    contadorMensagem.textContent = 'Continue assim, ótimo começo!';
  } else if (totalCliques < 10) {
    contadorMensagem.textContent = 'Você está adicionando vários itens!';
  } else {
    contadorMensagem.textContent = 'Uau! Muitos itens adicionados!';
  }
}
atualizarMensagem();

// Função emoji categoria
function getEmoji(categoria) {
  switch (categoria) {
    case 'Frutas': return '🍎';
    case 'Bebidas': return '🥤';
    case 'Limpeza': return '🧼';
    case 'Outros': return '🛍️';
    default: return '🛒';
  }
}

// Pega itens do localStorage ou array vazio
let itens = JSON.parse(localStorage.getItem('itens')) || [];
let filtroAtivo = 'Todas';

// Salva itens no localStorage
function salvarItens() {
  localStorage.setItem('itens', JSON.stringify(itens));
}

// Atualiza total exibido
function atualizarTotal() {
  const itensFiltrados = filtroAtivo === 'Todas' ? itens : itens.filter(i => i.categoria === filtroAtivo);
  const total = itensFiltrados.reduce((acc, item) => acc + parseFloat(item.preco), 0);
  totalDisplay.textContent = `💵 Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Cria elemento HTML do item
function criarItemElemento(item) {
  const li = document.createElement('li');
  li.classList.add('fade-in');
  li.innerHTML = `
    <div class="item-card" data-id="${item.id}">
      <div class="item-text">
        <p class="item-nome">${getEmoji(item.categoria)} ${item.nome}</p>
        <p class="item-categoria">📁 ${item.categoria}</p>
        <p class="item-preco">💸 R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
      </div>
      <div class="item-actions">
        <button class="edit-btn" data-id="${item.id}" title="Editar item">✏️</button>
        <button class="remove-btn" data-id="${item.id}" title="Remover item">✖</button>
      </div>
    </div>
  `;
  return li;
}

// Renderiza a lista na tela
function renderizarLista() {
  lista.innerHTML = '';
  const itensFiltrados = filtroAtivo === 'Todas' ? itens : itens.filter(i => i.categoria === filtroAtivo);
  itensFiltrados.forEach(item => {
    lista.appendChild(criarItemElemento(item));
  });
  atualizarTotal();
}

// Inicia edição do item
function iniciarEdicao(id) {
  const index = itens.findIndex(i => i.id === id);
  if (index === -1) return;
  const item = itens[index];
  const li = [...lista.children].find(liElem => liElem.querySelector('.edit-btn').dataset.id === id);
  if (!li) return;
  li.innerHTML = `
    <div class="item-card edit-mode">
      <input type="text" class="edit-nome" value="${item.nome}">
      <input type="number" class="edit-preco" step="0.01" value="${item.preco}">
      <select class="edit-categoria">
        <option value="Frutas" ${item.categoria === 'Frutas' ? 'selected' : ''}>Frutas</option>
        <option value="Bebidas" ${item.categoria === 'Bebidas' ? 'selected' : ''}>Bebidas</option>
        <option value="Limpeza" ${item.categoria === 'Limpeza' ? 'selected' : ''}>Limpeza</option>
        <option value="Outros" ${item.categoria === 'Outros' ? 'selected' : ''}>Outros</option>
      </select>
      <div class="item-actions">
        <button class="save-btn" data-id="${id}">Salvar</button>
        <button class="cancel-btn" data-id="${id}">Cancelar</button>
      </div>
    </div>
  `;
}

// Eventos para editar/remover/salvar/cancelar item
lista.addEventListener('click', event => {
  const target = event.target;
  const id = target.getAttribute('data-id');
  if (!id) return;
  const index = itens.findIndex(i => i.id === id);
  if (index === -1) return;

  if (target.classList.contains('edit-btn')) {
    iniciarEdicao(id);
  } else if (target.classList.contains('remove-btn')) {
    const li = target.closest('li');
    li.classList.add('removed');
    setTimeout(() => {
      itens.splice(index, 1);
      salvarItens();
      renderizarLista();
    }, 300);
  } else if (target.classList.contains('save-btn')) {
    const li = target.closest('li');
    const nomeEdit = li.querySelector('.edit-nome').value.trim();
    const precoEdit = li.querySelector('.edit-preco').value;
    const categoriaEdit = li.querySelector('.edit-categoria').value;
    if (!nomeEdit || !precoEdit || !categoriaEdit) {
      alert('Preencha todos os campos para salvar a edição.');
      return;
    }
    itens[index] = { id, nome: nomeEdit, preco: precoEdit, categoria: categoriaEdit };
    salvarItens();
    renderizarLista();
  } else if (target.classList.contains('cancel-btn')) {
    renderizarLista();
  }
});

// Evento para adicionar novo item
form.addEventListener('submit', event => {
  event.preventDefault();

  // Atualiza contador, botão e mensagem
  totalCliques++;
  localStorage.setItem('totalCliques', totalCliques);
  btnAdicionar.textContent = `Adicionar (${totalCliques})`;
  atualizarMensagem();

  const nome = itemInput.value.trim();
  const preco = precoInput.value;
  const categoria = categoriaInput.value;

  if (!nome || !preco || !categoria) {
    alert("Preencha todos os campos para adicionar o item.");
    return;
  }

  const novoItem = {
    id: Date.now().toString() + Math.random(),
    nome,
    preco,
    categoria
  };

  itens.push(novoItem);
  salvarItens();
  renderizarLista();

  itemInput.value = '';
  precoInput.value = '';
  categoriaInput.value = '';
});

// Evento para limpar lista
limparListaBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar toda a lista?')) {
    itens = [];
    salvarItens();
    renderizarLista();
  }
});

// Eventos para filtros
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.getAttribute('data-filter');
    renderizarLista();
  });

  const toggleThemeBtn = document.getElementById('toggleThemeBtn');

function aplicarTema() {
  const temaSalvo = localStorage.getItem('tema') || 'light';

  document.body.classList.remove('dark-mode');

  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
    toggleThemeBtn.textContent = 'Ativar Modo Claro';
  } else {
    toggleThemeBtn.textContent = 'Ativar Modo Escuro';
  }
}

aplicarTema();

toggleThemeBtn.addEventListener('click', () => {
  const temaAtual = localStorage.getItem('tema') || 'light';
  const novoTema = temaAtual === 'light' ? 'dark' : 'light';
  localStorage.setItem('tema', novoTema);
  aplicarTema();
});

});

// Inicializa mensagem e lista
atualizarMensagem();
renderizarLista();

