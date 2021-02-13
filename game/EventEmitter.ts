interface EventCallback {
  <T>(payload: T);
  oneShot?: boolean;
  remove?: () => void;
}

export default abstract class EventEmitter {
  protected evNames: string[];
  protected subscriptions: {
    [key: string]: {
      [id: string]: EventCallback;
    };
  };

  constructor(evNames: string[]) {
    this.evNames = evNames;
    this.subscriptions = {};
    this.evNames.forEach((evName) => {
      this.subscriptions[evName] = {};
    });
  }

  on(evName: string, callback: EventCallback): boolean | (() => void) {
    if (this.evNames.includes(evName) === false) return false;
    const subId = getId();
    this.subscriptions[evName][subId] = callback;
    return () => delete this.subscriptions[evName][subId];
  }

  once(evName: string, callback: EventCallback): boolean | void {
    if (this.evNames.includes(evName) === false) return false;
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
