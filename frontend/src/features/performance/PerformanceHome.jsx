import React, { useState, useEffect } from 'react';
import { getMyReviews, getAllReviews, acknowledgeReview } from './api/performanceService';
import CreateReviewModal from './components/CreateReviewModal';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import './Performance.css';

const PerformanceHome = () => {
    const role = localStorage.getItem('userRole') || 'EMPLOYEE';
    const isAdmin = role === 'HR_MANAGER' || role === 'SUPER_ADMIN';

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const res = await getAllReviews();
                setReviews(res.data || []);
            } else {
                const res = await getMyReviews();
                setReviews(res.data || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [isAdmin]);

    const handleAcknowledge = async (id) => {
        try {
            await acknowledgeReview(id);
            fetchReviews(); // refresh
        } catch (error) {
            alert('Error acknowledging review');
        }
    };

    // Calculate averages for radar chart
    const getChartData = (kpis) => {
        if (!kpis) return [];
        return [
            { subject: 'Quality', A: kpis.qualityOfWork, fullMark: 5 },
            { subject: 'Comm.', A: kpis.communication, fullMark: 5 },
            { subject: 'Punctual', A: kpis.punctuality, fullMark: 5 },
            { subject: 'Teamwork', A: kpis.teamwork, fullMark: 5 },
            { subject: 'Initiative', A: kpis.initiative, fullMark: 5 },
        ];
    };

    return (
        <DashboardLayout title="Performance">
            <div className="perf-container">
                <div className="perf-header">
                <div>
                    <h1>{isAdmin ? 'Performance Management' : 'My Performance Reviews'}</h1>
                    <p>{isAdmin ? 'Manage and create employee performance reviews.' : 'Track your KPIs, goals, and managerial feedback.'}</p>
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        + New Review
                    </button>
                )}
            </div>

            <div className="perf-content">
                {loading ? (
                    <div className="loading-state">Loading performance data...</div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📈</div>
                        <h3>No Reviews Found</h3>
                        <p>{isAdmin ? 'Start by creating a new performance review for an employee.' : 'You have not received any performance reviews yet.'}</p>
                    </div>
                ) : (
                    <div className="reviews-grid">
                        {reviews.map(review => (
                            <div key={review._id} className="review-card">
                                <div className="review-card-header">
                                    <div>
                                        <h3 className="review-cycle">{review.reviewCycle} {review.year}</h3>
                                        {isAdmin ? (
                                            <div className="review-emp-name">Employee: {review.employeeId?.name}</div>
                                        ) : (
                                            <div className="review-emp-name">Reviewer: {review.reviewerId?.name}</div>
                                        )}
                                    </div>
                                    <div className="overall-score">
                                        {review.overallScore}
                                        <span>/ 5.0</span>
                                    </div>
                                </div>
                                
                                <div className="radar-chart-container">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getChartData(review.kpis)}>
                                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                            <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="review-feedback">
                                    <strong>Manager Feedback:</strong>
                                    <p>{review.feedback}</p>
                                </div>

                                <div className="review-footer">
                                    <span className={`status-badge status-${review.status.toLowerCase()}`}>
                                        {review.status}
                                    </span>
                                    {!isAdmin && review.status === 'Submitted' && (
                                        <button className="btn-secondary btn-sm" onClick={() => handleAcknowledge(review._id)}>
                                            Acknowledge
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateModal && (
                <CreateReviewModal 
                    onClose={() => setShowCreateModal(false)} 
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchReviews();
                    }} 
                />
            )}
            </div>
        </DashboardLayout>
    );
};

export default PerformanceHome;
