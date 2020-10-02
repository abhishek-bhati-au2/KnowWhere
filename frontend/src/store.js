import { observable, action } from "mobx";
import { makeObservable } from "mobx";
import { configure } from "mobx";
configure({ computedConfigurable: true });
class ConversionsStore {
  conversions = [];
  
  constructor(){
    makeObservable  (this, {
      conversions: observable,
      setConversions: action
    });
  }
  setConversions(conversions) {
    this.conversions = conversions;
  }
}
// ConversionsStore = makeObservable  (ConversionsStore, {
//   conversions: observable,
//   setConversions: action
// });
export { ConversionsStore };