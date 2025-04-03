// Configurações do GitHub
const GITHUB_USERNAME = 'seu-usuario'; 
const REPO_NAME = 'meu-jogo-3d'; 
const FILE_PATH = 'players.json'; 
const TOKEN = 'seu-token'; 

// Função para carregar os jogadores
async function getPlayers() {
    const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${FILE_PATH}`);
    return response.ok ? await response.json() : {};
}

// Função para salvar os jogadores
async function savePlayers(players) {
    const content = btoa(JSON.stringify(players, null, 2)); 
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Atualizando jogadores',
            content,
            sha: await getFileSHA()
        })
    });
    return response.ok;
}

// Obtém o SHA do arquivo para sobrescrever
async function getFileSHA() {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FILE_PATH}`);
    const data = await response.json();
    return data.sha;
}

// Jogador e árvores
let trees = [];
const maxTrees = 25;
const player = { x: 0, y: 0, wood: 0 };

// Criar ranking
const leaderboard = document.getElementById('leaderboard');

// Spawna árvores até o limite
function spawnTree() {
    if (trees.length < maxTrees) {
        const tree = { x: Math.random() * 500, y: Math.random() * 500, health: 5 };
        trees.push(tree);
    }
}

// Atualiza a tabela de ranking
function updateLeaderboard() {
    getPlayers().then(players => {
        const sortedPlayers = Object.entries(players).sort((a, b) => b[1].wood - a[1].wood);
        leaderboard.innerHTML = sortedPlayers.map(([name, data]) => `${name}: ${data.wood}`).join('<br>');
    });
}

// Movimenta jogador
document.getElementById('move').onclick = () => player.x += 10;

// Corta árvore
document.getElementById('chop').onclick = () => {
    const tree = trees.find(t => Math.abs(t.x - player.x) < 10 && Math.abs(t.y - player.y) < 10);
    if (tree) {
        tree.health--;
        if (tree.health <= 0) {
            trees = trees.filter(t => t !== tree);
            player.wood++;
            savePlayers({ ...getPlayers(), ["player"]: { wood: player.wood } });
            spawnTree();
            updateLeaderboard();
        }
    }
};

// Checagem anti-cheat
function antiCheat() {
    if (window.self !== window.top) {
        document.body.innerHTML = '<h1>Cheat detectado!</h1>';
        throw new Error('Cheat detectado!');
    }
}
antiCheat();

// Inicia o jogo
setInterval(spawnTree, 5000);
setInterval(updateLeaderboard, 5000);
