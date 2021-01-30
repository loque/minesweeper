interface EventCallback {
  <T>(payload: T);
  oneShot?: boolean;
  remove?: () => void;
}

export default abstract class EventEmitter {
  protected subscriptions: {
    [key: string]: {
      [id: string]: EventCallback;
    };
  };

  on(evName: string, callback: EventCallback): () => void {
    const subId = getId();
    this.subscriptions[evName][subId] = callback;
    return () => delete this.subscriptions[evName][subId];
  }

  once(evName: string, callback: EventCallback): void {
    const subId = getId();
    callback.remove = () => delete this.subscriptions[evName][subId];
    this.subscriptions[evName][subId] = callback;
  }

  protected emit(evName: string, payload: any) {
    if (this.subscriptions.hasOwnProperty(evName) === false) return;
    const callbacks = Object.values(this.subscriptions[evName]);
    callbacks.forEach((callback) => {
      callback(payload);
      if (typeof callback.remove === "function") callback.remove();
    });
  }
}

let id = 0;
function getId() {
  return String(id++);
}
