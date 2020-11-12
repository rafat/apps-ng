import { types, flow } from 'mobx-state-tree'

export const CONTRACT_HELLOWORLD = 5;

export const createHelloWorldAppStore = (defaultValue = {}, options = {}) => {
  const HelloWorldAppStore = types
    .model('HelloWorldAppStore', {
      mnemonic: types.maybeNull(types.string)
    })
    .actions(self => ({
      SetMnemonic (mnemonic) {
        self.mnemonic = mnemonic
      },
      async queryMnemonic (runtime) {
        return await runtime.query(CONTRACT_HELLOWORLD, 'GetMnemonic')
      }
    }))

  return HelloWorldAppStore.create(defaultValue)
}

