import "react-perfect-scrollbar/dist/css/styles.css";

import React from "react";
import { HashRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import AppLayout from "layouts/AppLayout";
import Bridge from "app/bridge/Bridge";

function Redirect() {
    const navigate = useNavigate();
    React.useEffect(() => {
        navigate("/bridge");
    });
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Redirect />} />
                    <Route path="bridge" element={<Bridge />} />
                    {/* <Route path="assets" element={<Assets />} /> */}
                    {/* <Route path="transactions" element={<Transactions />} /> */}
                    {/* <Route path="support" element={<Support />} /> */}
                    {/* <Route path="dashboard" element={<Dashboard />} /> */}
                    <Route path="*" element={<Redirect />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
