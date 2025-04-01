# RegTrack - Faz o monitoramento e persistência de eventos relacionados a registro de um ramal do PABX Asterisk.

# Instalação:
    O projeto utiliza banco de dados MySQL e implementa uma tabela e uma view:
    * ami_events
    * view_peerStatus

    Dentro do diretório da aplicação, execute:
    npm start

# Funcionamento:
    Tabela ami_events - armazena a company, o ramal (exten), o status (reachable ou unreachable) e a data e horário do evento.
    View view_peerStatus - lista horário de reachable, hora'rio do subsequente unreachable e o delta do tempo entre os dois eventos.

    Colocar aqui as tabelas e view. Remover do código. A criação de tabelas será feita pelo painel.

# Fazer e configurar o log do projeto.
# Criar um .env para armazenar as senhas de acesso