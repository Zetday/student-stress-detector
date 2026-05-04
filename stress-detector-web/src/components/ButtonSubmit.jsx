import React from "react";
import { useTransition } from "react";

function ButtonSubmit({children}){
    const { t } = useTransition;
    return (
        <button className="w-full bg-blue-700 hover:bg-blue-800 
            text-white py-3 rounded-lg font-medium transition text-2xl">
            {children}
          </button>
    );
}

export default ButtonSubmit;