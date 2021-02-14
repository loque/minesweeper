type CleanFunction = () => void;

interface EventCallback {
  <T>(payload: T);
  remove?: CleanFunction;
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

  on(evName: string, callback: EventCallback): CleanFunction {
    this.validateEventName(evName);
    return this.registerSubscription(evName, callback);
  }

  once(evName: string, callback: EventCallback): CleanFunction {
    this.validateEventName(evName);
    const cleanFunction = this.registerSubscription(evName, callback);
    callback.remove = cleanFunction;
    return cleanFunction;
  }

  private validateEventName(evName: string): void {
    if (this.evNames.includes(evName) === false)
      throw new Error(
        `event name ${evName} does not exist in EventEmitter.evNames (${this.evNames.join(
          '","'
        )})`
      );
  }

  private registerSubscription(evName, callback): CleanFunction {
    const subId = getId();
    this.subscriptions[evName][subId] = callback;
    return () => delete this.subscriptions[evName][subId];
  }

  protected emit(evName: string, payload: any): void {
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
