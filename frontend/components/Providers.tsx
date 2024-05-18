"use client"
import React, { useEffect } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { checkWallet, getOwnerNFTs } from '@/services/blockchain'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Providers = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        checkWallet()
        // getOwnerNFTs();
        // setShowChild(true)
    }, [])
    return (
        <>
            <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                <Provider store={store}>
                    {children}
                </Provider>
                <ToastContainer
                    position="bottom-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            </ThemeProvider>
        </>
    )
}

export default Providers