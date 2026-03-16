import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddBrokerForm from '../../components/AddBrokerForm';

const ViewBrokerPage = ({ onBack }) => {
    const { id } = useParams();

    return (
        <AddBrokerForm 
            brokerId={id} 
            mode="view" 
            onBack={onBack} 
        />
    );
};

export default ViewBrokerPage;
