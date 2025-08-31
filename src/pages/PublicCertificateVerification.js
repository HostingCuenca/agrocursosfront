import React from 'react';
import CertificateVerifier from '../components/certificates/CertificateVerifier';

const PublicCertificateVerification = () => {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header público */}
            <header className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-neutral-900 font-bold text-sm">C</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-neutral-900">CFDA</h1>
                                <p className="text-xs text-neutral-500">Centro de Formación Desarrollo Agropecuario</p>
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <p className="text-sm text-neutral-600">Verificación Pública</p>
                            <p className="text-xs text-neutral-500">Sistema de Certificados</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="py-8">
                <CertificateVerifier />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-neutral-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-sm text-neutral-600">
                        <p>&copy; 2025 Centro de Formación Desarrollo Agropecuario (CFDA)</p>
                        <p className="mt-1">Sistema de Verificación de Certificados</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicCertificateVerification;