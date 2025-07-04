// Pegando os elementos do DOM
const form = document.getElementById('form');
const itemInput = document.getElementById('itemInput');
const precoInput = document.getElementById('precoInput');
const categoriaInput = document.getElementById('categoriaInput');
const lista = document.getElementById('lista');
const totalDisplay = document.getElementById('total');
const limparListaBtn = document.getElementById('limparListaBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

// Função para retornar um emoji baseado na categoria
function getEmoji(categoria) {
  switch (categoria) {
    case 'Frutas': return '🍎';
    case 'Bebidas': return '🥤';
    case 'Limpeza': return '🧼';
    case 'Outros': return '🛍️';
    default: return '🛒';
  }
}

// Recuperando os itens salvos no localStorage ou um array vazio caso não haja
let itens = JSON.parse(localStorage.getItem('itens')) || [];

// Variável para armazenar o filtro ativo
let filtroAtivo = 'Todas';

// Função para salvar os itens no localStorage
function salvarItens() {
  localStorage.setItem('itens', JSON.stringify(itens));
}

// Função para atualizar o valor total dos itens exibidos
function atualizarTotal() {
  // Filtra os itens com base no filtro ativo
  const itensFiltrados = filtroAtivo === 'Todas' ? itens : itens.filter(i => i.categoria === filtroAtivo);
  // Calcula o total somando os preços dos itens filtrados
  const total = itensFiltrados.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  // Exibe o total na tela
  totalDisplay.textContent = `💵 Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Função para criar o elemento HTML de um item da lista
function criarItemElemento(item) {
  const li = document.createElement('li');
  li.classList.add('fade-in'); // Adiciona a classe de animação de fade-in

  // Adiciona o conteúdo HTML para o item
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

// Função para renderizar a lista de itens
function renderizarLista() {
  lista.innerHTML = ''; // Limpa a lista atual

  // Filtra os itens com base no filtro ativo
  const itensFiltrados = filtroAtivo === 'Todas'
    ? itens
    : itens.filter(item => item.categoria === filtroAtivo);

  // Cria e adiciona os itens filtrados à lista
  itensFiltrados.forEach(item => {
    const li = criarItemElemento(item);
    lista.appendChild(li);
  });

  // Atualiza o total de itens
  atualizarTotal();
}

// Função para iniciar a edição de um item
function iniciarEdicao(id) {
  const index = itens.findIndex(i => i.id === id);
  if (index === -1) return;

  const item = itens[index];
  const li = [...lista.children].find(liElem => liElem.querySelector('.edit-btn').dataset.id === id);
  if (!li) return;

  // Substitui o conteúdo do item por campos editáveis
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

// Evento de clique na lista para editar ou remover itens
lista.addEventListener('click', event => {
  const target = event.target;
  const id = target.getAttribute('data-id');
  if (!id) return;

  const index = itens.findIndex(i => i.id === id);
  if (index === -1) return;

  if (target.classList.contains('edit-btn')) {
    // Inicia a edição do item
    iniciarEdicao(id);

  } else if (target.classList.contains('remove-btn')) {
    // Remove o item da lista
    const li = target.closest('li');
    li.classList.add('removed');
    setTimeout(() => {
      itens.splice(index, 1); // Remove o item do array
      salvarItens();
      renderizarLista();
    }, 300);

  } else if (target.classList.contains('save-btn')) {
    // Salva as alterações feitas no item
    const li = target.closest('li');
    const nomeEdit = li.querySelector('.edit-nome').value.trim();
    const precoEdit = li.querySelector('.edit-preco').value;
    const categoriaEdit = li.querySelector('.edit-categoria').value;

    if (!nomeEdit || !precoEdit || !categoriaEdit) {
      alert('Preencha todos os campos para salvar a edição.');
      return;
    }

    // Atualiza o item no array
    itens[index] = { id, nome: nomeEdit, preco: precoEdit, categoria: categoriaEdit };
    salvarItens();
    renderizarLista();

  } else if (target.classList.contains('cancel-btn')) {
    // Cancela a edição e retorna para a lista original
    renderizarLista();
  }
});

// Evento para adicionar um novo item ao enviar o formulário
form.addEventListener('submit', event => {
  event.preventDefault();

  const nome = itemInput.value.trim();
  const preco = precoInput.value;
  const categoria = categoriaInput.value;

  if (!nome || !preco || !categoria) {
    alert("Preencha todos os campos para adicionar o item.");
    return;
  }

  // Cria um novo item e adiciona ao array
  const novoItem = {
    id: Date.now().toString() + Math.random(),
    nome,
    preco,
    categoria
  };

  itens.push(novoItem);
  salvarItens();
  renderizarLista();

  // Limpa os campos de entrada
  itemInput.value = '';
  precoInput.value = '';
  categoriaInput.value = '';
});

// Evento para limpar toda a lista de itens
limparListaBtn.addEventListener('click', () => {
  if (confirm('Tem certeza que deseja limpar toda a lista?')) {
    itens = []; // Limpa o array de itens
    salvarItens();
    renderizarLista();
  }
});

// Evento para aplicar filtros na lista de itens
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Atualiza o filtro ativo e renderiza a lista novamente
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filtroAtivo = btn.getAttribute('data-filter');
    renderizarLista();
  });
});

// Renderiza a lista inicialmente
renderizarLista();
