/**
 * @file FormContext.tsx
 * @author Jakub Zelenay (xzelen29)
 * @description Context for storing form data during the task creation process
 */

import React, { createContext, useState, useContext } from 'react';
import MapView, { Address } from 'react-native-maps';
import { Geohash } from 'geofire-common';

interface FormData {
    /**
     * Indicates whether the user is offering a task or seeking a task.
     * True if offering a task, false if seeking a task.
     */
    offeringTask?: boolean;
    username?: string;
    title?: string;
    price?: number;
    description?: string;
    date?: Date;
    coordinates?: { latitude: number; longitude: number, geohash?: Geohash };
    address?: Address;
    category?: Category;
    images?: string[];
}

export enum Category {
    Professionals = 'Professionals',
    Furniture = 'Furniture',
    Moving = 'Moving',
    Housework = 'Housework',
    Garden = 'Garden',
    Cleaning = 'Cleaning',
}

interface FormContextProps {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const FormProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [formData, setFormData] = useState<FormData>({});

    return (
        <FormContext.Provider value={{ formData, setFormData }}>
            {children}
        </FormContext.Provider>
    );
};

export const useForm = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useForm must be used within a FormProvider');
    }
    return context;
};
