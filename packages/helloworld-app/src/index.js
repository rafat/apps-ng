import React, { useEffect, useState, useMemo } from 'react'
import styled from "styled-components"
import { observer } from 'mobx-react'
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react'
import { Plus as PlusIcon } from '@zeit-ui/react-icons'

import { useStore } from "@/store"
import Container from '@/components/Container'
import UnlockRequired from '@/components/accounts/UnlockRequired'
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_HELLOWORLD, createHelloWorldAppStore } from './utils/AppStore'
import { reaction } from 'mobx'

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the HelloWorld app page
 */
const AppHeader = () => (
  <Container>
    <h1>MNEMONIC STORAGE</h1>
  </Container>
)

/**
 * Body of the HelloWorld app page
 */
const AppBody = observer(() => {
  const { appRuntime, helloworldApp } = useStore();
  const [, setToast] = useToasts()
  const { state: mnemonic, bindings } = useInput('')

  /**
   * Updates the counter by querying the helloworld contract
   * The type definitions of `GetCount` request and response can be found at contract/helloworld.rs
   */
  async function updateMnemonic () {
    if (!helloworldApp) return
    try {
      const response = await helloworldApp.queryMnemonic(appRuntime)
     

      helloworldApp.setMnemonic(response.GetMnemonic.mnemonic)
    } catch (err) {
      setToast(err.message, 'error')
    }
  }

  /**
   * The `increment` transaction payload object
   * It follows the command type definition of the contract (at contract/helloworld.rs)
   */
  const setMnemonicPayload = useMemo(() => {
	return {
		setMnemonic: {
			mnemonic: mnemonic
		}
	}
  }, [mnemonic])

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1}/>

      <h3>Check Wallet Mnemonic</h3>
      <section>
        <div>Mnemonic: {helloworldApp.mnemonic === null ? 'unknown' : helloworldApp.mnemonic}</div>
        <div><Button onClick={updateMnemonic}>Update</Button></div>
      </section>
      <Spacer y={1}/>

      <h3>Update Mnemonic</h3>
      <section>
        <div>
          <Input label="Change Mnemonic" {...bindings} />
        </div>
        <ButtonWrapper>
          {/**  
            * PushCommandButton is the easy way to send confidential contract txs.
            * Below it's configurated to send HelloWorld::Increment()
            */}
          <PushCommandButton
              // tx arguments
              contractId={CONTRACT_HELLOWORLD}
              payload={setMnemonicPayload}
              // display messages
              modalTitle='WALLET MNEMONIC'
              modalSubtitle={`Change to ${mnemonic}`}
              onSuccessMsg='Tx succeeded'
              // button appearance
              buttonType='secondaryLight'
              icon={PlusIcon}
              name='Update'
            />
        </ButtonWrapper>
      </section>

    </Container>
  )
})

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return
    if (typeof appStore.hellowrldApp !== 'undefined') return
    appStore.helloworldApp = createHelloWorldAppStore({})
  }, [appStore])

  useEffect(() => reaction(
    () => appStore.helloworldApp,
    () => {
      if (appStore.helloworldApp && !shouldRenderContent) {
        setShouldRenderContent(true)
      }
    },
    { fireImmediately: true })
  )

  return shouldRenderContent && children;
})

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppHeader />
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
)
