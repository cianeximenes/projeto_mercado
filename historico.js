// Carregar vendas do localStorage
function carregarVendas() {
    const vendasLocal = localStorage.getItem('vendasXimenes');
    return vendasLocal ? JSON.parse(vendasLocal) : gerarVendasExemplo();
}

// Carregar estoque para calcular custos
function carregarEstoque() {
    const estoqueLocal = localStorage.getItem('estoqueXimenes');
    return estoqueLocal ? JSON.parse(estoqueLocal) : [];
}

// Gerar vendas de exemplo (remover quando conectar com Python)
function gerarVendasExemplo() {
    return [
        {
            id: 1,
            data: "2024-11-28T13:32:00",
            metodoPagamento: "pix",
            total: 41.56,
            produtos: [
                { nome: "Arroz Camil 5kg", quantidade: 1, preco: 25.90, precoCusto: 20.00 },
                { nome: "Feijão 1kg", quantidade: 2, preco: 7.83, precoCusto: 6.50 }
            ],
            descricao: ""
        },
        {
            id: 2,
            data: "2024-11-25T13:32:00",
            metodoPagamento: "cartao",
            total: 121.47,
            produtos: [
                { nome: "Óleo de Soja", quantidade: 5, preco: 7.20, precoCusto: 5.50 },
                { nome: "Arroz Camil 5kg", quantidade: 3, preco: 25.90, precoCusto: 20.00 }
            ],
            descricao: ""
        },
        {
            id: 3,
            data: "2024-11-21T13:32:00",
            metodoPagamento: "dinheiro",
            total: 2.50,
            produtos: [
                { nome: "Produto teste", quantidade: 1, preco: 2.50, precoCusto: 1.00 }
            ],
            descricao: ""
        },
        {
            id: 4,
            data: "2024-10-28T13:32:00",
            metodoPagamento: "pix",
            total: 41.56,
            produtos: [
                { nome: "Arroz Camil 5kg", quantidade: 1, preco: 25.90, precoCusto: 20.00 },
                { nome: "Feijão 1kg", quantidade: 2, preco: 7.83, precoCusto: 6.50 }
            ],
            descricao: ""
        },
        {
            id: 5,
            data: "2024-10-25T13:32:00",
            metodoPagamento: "cartao",
            total: 121.47,
            produtos: [
                { nome: "Óleo de Soja", quantidade: 5, preco: 7.20, precoCusto: 5.50 },
                { nome: "Arroz Camil 5kg", quantidade: 3, preco: 25.90, precoCusto: 20.00 }
            ],
            descricao: ""
        }
    ];
}

// Agrupar vendas por mês
function agruparPorMes(vendas) {
    const grupos = {};
    
    vendas.forEach(venda => {
        const data = new Date(venda.data);
        const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grupos[mesAno]) {
            grupos[mesAno] = [];
        }
        grupos[mesAno].push(venda);
    });
    
    return grupos;
}

// Calcular totais financeiros
function calcularTotais(vendas) {
    let entradas = 0;
    let saidas = 0;
    
    vendas.forEach(venda => {

        entradas += venda.total;
        
        venda.produtos.forEach(produto => {
            const custo = produto.precoCusto || 0;
            saidas += custo * produto.quantidade;
        });
    });
    
    const lucro = entradas - saidas;
    
    return { entradas, saidas, lucro };
}

// Renderizar vendas por mês
function renderizarVendas(vendas = null) {
    const todasVendas = vendas || carregarVendas();
    const container = document.getElementById('container-meses');
    
    if (todasVendas.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <i class="fa-solid fa-receipt"></i>
                <p>Nenhuma venda registrada ainda</p>
            </div>
        `;
        return;
    }
    
    // Ordenar vendas por data 
    todasVendas.sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Agrupar por mês
    const grupos = agruparPorMes(todasVendas);
    
    // Renderizar cada mês
    container.innerHTML = '';
    Object.keys(grupos).sort().reverse().forEach(mesAno => {
        const [ano, mes] = mesAno.split('-');
        const nomesMeses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 
                            'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
        const nomeMes = nomesMeses[parseInt(mes) - 1];
        
        // Calcular totais do mês
        const { entradas, saidas, lucro } = calcularTotais(grupos[mesAno]);
        
        const secaoMes = document.createElement('div');
        secaoMes.className = 'secao-mes';
        
        secaoMes.innerHTML = `
            <div class="header-mes">
                <i class="fa-solid fa-calendar"></i>
                <span>${nomeMes}</span>
            </div>
            
            <!-- RESUMO FINANCEIRO DO MÊS -->
            <div class="resumo-mes">
                <div class="card-resumo">
                    <i class="fa-solid fa-arrow-up icone-entrada"></i>
                    <div>
                        <p class="label-resumo">Entradas</p>
                        <p class="valor-resumo">R$ ${entradas.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="card-resumo">
                    <i class="fa-solid fa-arrow-down icone-saida"></i>
                    <div>
                        <p class="label-resumo">Saídas</p>
                        <p class="valor-resumo">R$ ${saidas.toFixed(2)}</p>
                    </div>
                </div>
                
                <div class="card-resumo">
                    <i class="fa-solid fa-chart-line icone-lucro"></i>
                    <div>
                        <p class="label-resumo">Lucro Bruto</p>
                        <p class="valor-resumo">R$ ${lucro.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <div class="lista-vendas" id="lista-${mesAno}"></div>
        `;
        
        container.appendChild(secaoMes);
        
        // Renderizar vendas do mês
        const listaVendas = document.getElementById(`lista-${mesAno}`);
        grupos[mesAno].forEach(venda => {
            const data = new Date(venda.data);
            const dia = String(data.getDate()).padStart(2, '0');
            const mesNum = String(data.getMonth() + 1).padStart(2, '0');
            const hora = `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
            
            const metodoClasse = `metodo-${venda.metodoPagamento.toLowerCase().replace('ã', 'a')}`;
            const metodoTexto = venda.metodoPagamento.toUpperCase();
            
            const itemVenda = document.createElement('div');
            itemVenda.className = 'item-venda';
            itemVenda.onclick = () => abrirDetalhes(venda);
            
            itemVenda.innerHTML = `
                <div>
                    <div class="venda-data">${dia}/${mesNum}</div>
                </div>
                <div class="venda-hora">${hora}</div>
                <div class="venda-metodo ${metodoClasse}">${metodoTexto}</div>
                <div class="venda-total">
                    <div class="label-total">TOTAL</div>
                    R$ ${venda.total.toFixed(2)}
                </div>
            `;
            
            listaVendas.appendChild(itemVenda);
        });
    });
}

// Abrir modal de detalhes
function abrirDetalhes(venda) {
    const modal = document.getElementById('modal-detalhes');
    const conteudo = document.getElementById('conteudo-detalhes');
    
    const data = new Date(venda.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let custosTotal = 0;
    venda.produtos.forEach(p => {
        custosTotal += (p.precoCusto || 0) * p.quantidade;
    });
    
    const lucroVenda = venda.total - custosTotal;
    
    conteudo.innerHTML = `
        <div class="detalhes-header">
            <p><strong>Data:</strong> ${dataFormatada} às ${horaFormatada}</p>
            <p><strong>Método:</strong> ${venda.metodoPagamento.toUpperCase()}</p>
            ${venda.descricao ? `<p><strong>Descrição:</strong> ${venda.descricao}</p>` : ''}
        </div>
        
        <div class="detalhes-produtos">
            <h4>Produtos:</h4>
            ${venda.produtos.map(p => `
                <div class="produto-detalhe">
                    <div>
                        <div class="produto-detalhe-nome">${p.nome}</div>
                        <div style="color: #666; font-size: 0.9rem;">${p.quantidade}x R$ ${p.preco.toFixed(2)}</div>
                    </div>
                    <div class="produto-detalhe-info">
                        <strong>R$ ${(p.quantidade * p.preco).toFixed(2)}</strong>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="detalhes-totais">
            <p><span>Subtotal:</span> <span>R$ ${venda.total.toFixed(2)}</span></p>
            <p><span>Custos:</span> <span>R$ ${custosTotal.toFixed(2)}</span></p>
            <p class="total-final"><span>Lucro:</span> <span>R$ ${lucroVenda.toFixed(2)}</span></p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Fechar modal de detalhes
function fecharModalDetalhes() {
    document.getElementById('modal-detalhes').style.display = 'none';
}

// Buscar vendas
document.getElementById('busca-historico').addEventListener('input', function() {
    const termo = this.value.toLowerCase().trim();
    const todasVendas = carregarVendas();
    
    if (termo === '') {
        renderizarVendas(todasVendas);
        return;
    }
    
    const resultados = todasVendas.filter(venda => {
        const dataStr = new Date(venda.data).toLocaleDateString('pt-BR');
        const metodoStr = venda.metodoPagamento.toLowerCase();
        const produtosStr = venda.produtos.map(p => p.nome.toLowerCase()).join(' ');
        
        return dataStr.includes(termo) || 
               metodoStr.includes(termo) || 
               produtosStr.includes(termo) ||
               venda.total.toString().includes(termo);
    });
    
    renderizarVendas(resultados);
});

// Navegação
function irVendas() {
    window.location.href = 'compras.html';
}

function irEstoque() {
    window.location.href = 'estoque.html';
}

// Modal de sair
document.getElementById('btn-sair').onclick = () => {
    document.getElementById('modal-sair').style.display = 'flex';
};

document.getElementById('btn-nao').onclick = () => {
    document.getElementById('modal-sair').style.display = 'none';
};

document.getElementById('btn-sim').onclick = () => {
    window.location.href = 'index.html';
};

// Fechar modais ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Inicialização
window.onload = function() {
    renderizarVendas();
    
    // TODO: Quando conectar com Python, substituir por:
    // fetch('/api/vendas/listar')
    //     .then(res => res.json())
    //     .then(vendas => renderizarVendas(vendas));
};