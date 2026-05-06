import React from "react";
import clsx from "clsx";

const Textbox = ({ type, placeholder, label, className, labelClass, register, name, error }) => (
    <div className='w-full flex flex-col gap-1'>
    {label && (
     <label
          htmlFor={name}
           className={clsx("text-sm font-medium text-gray-700", labelClass)}>
    {label}
     </label>
)}
       <input type={type || "text"}
        id={name}
          placeholder={placeholder} 
          className={clsx("input-field", className)}
          {...register}
       />
           {error && (
           <span className='text-xs text-red-500 mt-0.5 '>{error}</span>)}
        </div>

);

Textbox.displayName = "Texbox";
export default Textbox;