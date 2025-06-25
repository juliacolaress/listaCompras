// Seleciona elementos da interface
const form = document.getElementById('form');
const itemInput = document.getElementById('itemInput');
const precoInput = document.getElementById('precoInput');
const categoriaInput = document.getElementById('categoriaInput');
const lista = document.getElementById('lista');
const totalDisplay = document.getElementById('total');

// Carrega itens do localStorage ou inicia vazio
let itens = JSON.parse(localStorage.getItem('itens')) || [];

// Salva no localStorage
function salvarItens() {
  localStorage.setItem('itens', JSON.stringify(itens));
}

// Atualiza o total da compra
function atualizarTotal() {
  const total = itens.reduce((soma, item) => soma + parseFloat(item.preco), 0);
  totalDisplay.textContent = `💵 Total: R$ ${total.toFixed(2).replace('.', ',')}`;
}

// Renderiza a lista de compras
function renderizarLista() {
  lista.innerHTML = '';

  itens.forEach((item, index) => {
    const li = document.createElement('li');

    li.innerHTML = `
      <div class="item-card">
        <div class="item-text">
          <p class="item-nome">🍓 ${item.nome}</p>
          <p class="item-categoria">📁 ${item.categoria}</p>
          <p class="item-preco">💸 R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
        </div>
        <button class="remove-btn" data-index="${index}" title="Remover item">✖</button>
      </div>
    `;

    lista.appendChild(li);
  });

  atualizarTotal();
}

// Adiciona item ao enviar o formulário
form.addEventListener('submit', function(event) {
  event.preventDefault();

  const nome = itemInput.value.trim();
  const preco = precoInput.value;
  const categoria = categoriaInput.value;

  if (nome && preco && categoria) {
    itens.push({ nome, preco, categoria });
    salvarItens();
    renderizarLista();

    // Limpa os campos do formulário
    itemInput.value = '';
    precoInput.value = '';
    categoriaInput.value = '';
  }
});

// Remove item ao clicar no botão ✖
lista.addEventListener('click', function(event) {
  if (event.target.classList.contains('remove-btn')) {
    const index = event.target.getAttribute('data-index');
    itens.splice(index, 1);
    salvarItens();
    renderizarLista();
  }
});

// Carrega lista ao abrir a página
renderizarLista();
