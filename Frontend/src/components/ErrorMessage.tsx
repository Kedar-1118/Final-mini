import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="flex items-center gap-2 p-4 mb-4 text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{message}</p>
        </div>
    );
};

export default ErrorMessage;
