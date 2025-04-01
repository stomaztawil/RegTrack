class EventHandlers {
    constructor(eventModel) {
      this.model = eventModel;
    }
  
    async handleEvent(event) {
      const eventName = event.event.replace(/\s+/g, '_').toLowerCase();
      this.logger.info("Event received: ", eventName);
      
      try {
        switch(eventName) {
          case 'devicestatechange':
            this.logger.info('Nothing to do for event: ', eventName);
            break;

          case 'peerstatus':
            await this.model.persistPeerStatus(event);
            break;

          default:
            this.logger.info('Nothing to do for event: ', eventName);
        }
      } catch (error) {
        console.error('Error processing event:', error);
      }
    }
  }
  
  module.exports = EventHandlers;