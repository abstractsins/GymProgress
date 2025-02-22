interface InfoCardProps {
    icon: any;
    title: string;
    value: string;
    description: string;
}
  
const InfoCard: React.FC<InfoCardProps> = ({ icon, title, value, description }) => {

    const textLength = value.length;
    const style = { "--char-count": textLength } as React.CSSProperties;  

    return (
        <div className="dashboard-card">
            <header className="dashboard-card">
                <div className="dashboard-card-icon">
                    {icon}
                </div>
                <h3>{title}</h3>
            </header>
            <div className="dashboard-card-body">
                <div className="dashboard-card-value-container">
                    <span 
                        className="dashboard-card-value"
                        style={style}
                    >{value}</span>
                </div>
                <div className="dashboard-card-desc-container">
                    <aside>{description}</aside>
                </div>
            </div>
        </div>
    );
};

export default InfoCard;
