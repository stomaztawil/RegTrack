class EventHandlers {
    constructor(eventModel) {
      this.model = eventModel;
    }
  
    async handleEvent(event) {
      const eventName = event.event.replace(/\s+/g, '_').toLowerCase();
      console.log("Evento recebido: " + eventName);
      
      try {
        switch(eventName) {
          case 'devicestatechange':
            console.log('Nada feito ainda para: ' + eventName);
            break;
          case 'peerstatus':
            await this.model.persistPeerStatus(event);
            break;
          default:
            console.log('Evento não tratado:', eventName);
        }
      } catch (error) {
        console.error('Erro ao processar evento:', error);
      }
    }
  }
  
  module.exports = EventHandlers;