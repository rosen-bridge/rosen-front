import 'react-perfect-scrollbar/dist/css/styles.css';
import React from "react";
import {HashRouter as Router, Routes, Route} from 'react-router-dom';
import {ROUTES} from "utils/routes";
import AppLayout from "layouts/AppLayout";
import Bridge from "app/bridge/Bridge";
import Assets from "app/assets/Assets";
import Transactions from "app/transactions/Transactions";
import Dashboard from "app/dashboard/Dashboard";
import Support from "app/support/Support";
import AppTheme from "layouts/AppTheme";
import NotFound from "layouts/NotFound";

function App() {
    return (
        <AppTheme>
            <Router>
                <Routes>
                    <Route element={<AppLayout/>}>
                        <Route path={ROUTES.Bridge} element={<Bridge/>}/>
                        <Route path={ROUTES.Assets} element={<Assets/>}/>
                        <Route path={ROUTES.Transactions} element={<Transactions/>}/>
                        <Route path={ROUTES.Support} element={<Support/>}/>
                        <Route path={ROUTES.Dashboard} element={<Dashboard/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Route>
                </Routes>
            </Router>
        </AppTheme>
    )
}

export default App;
