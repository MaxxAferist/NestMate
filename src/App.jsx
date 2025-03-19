import { useState } from 'react'
import Header from './components/Header/Header'
import './App.css'
import SignInWindow from './components/SignInWindow/SignInWindow.jsx'
import LoginWindow from './components/LoginWindow/LoginWindow.jsx'

function App() {
    const [tab, setTab] = useState('main')

  return (
    <>
        <Header tab={tab} setTab={setTab}/>
        <main>
            {/*{tab == 'mainPage' &&  }*/}
            {tab == 'login' && <LoginWindow tab={tab} setTab={setTab}/>}

            {tab == 'signIn' && <SignInWindow tab={tab} setTab={setTab}/>}
        </main>
    </>
  )
}

export default App
