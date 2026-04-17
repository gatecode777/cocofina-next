import React, { useState, useEffect } from 'react';
import '../styles/faqs.css';

const FAQPage = () => {
    const [activeTab, setActiveTab] = useState('cocofina-faq');

    useEffect(() => {
        document.title = "FAQ";
        window.scrollTo(0, 0);
    }, []);

    const openFaq = (tabName) => {
        setActiveTab(tabName);
    };

    return (
        <main>
            <section className="faq-section">
                <div className="container">
                    <div className="faq-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'cocofina-faq' ? 'active' : ''}`}
                            onClick={() => openFaq('cocofina-faq')}
                        >
                            Cocofina
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'sugar-faq' ? 'active' : ''}`}
                            onClick={() => openFaq('sugar-faq')}
                        >
                            Cocofina Sugar
                        </button>
                    </div>

                    <div id="cocofina-faq" className={`faq-content ${activeTab === 'cocofina-faq' ? 'active' : ''}`} style={{ display: activeTab === 'cocofina-faq' ? 'block' : 'none' }}>
                        <div className="faq-item">
                            <h4>How long does delivery take?</h4>
                            <p>
                                Orders are usually processed within 24–48 hours. Delivery time
                                may vary depending on your location, but most orders are
                                delivered within 3–7 business days.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Do you offer nationwide shipping?</h4>
                            <p>
                                Yes, we offer pan-India shipping so customers across the country
                                can enjoy Cocofina Sugar.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>How can I track my order?</h4>
                            <p>
                                Once your order is shipped, you will receive a tracking ID via
                                email or SMS. You can use this tracking number to check the
                                delivery status.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What are the shipping charges?</h4>
                            <p>
                                Shipping charges may vary depending on your location and order
                                value. In some cases, we offer free shipping on selected orders
                                or promotions.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What should I do if my product arrives damaged?</h4>
                            <p>
                                If your product arrives damaged, please contact our customer
                                support within 24–48 hours of delivery. Kindly share photos of
                                the damaged product and packaging so we can quickly assist you
                                with a replacement or refund.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Can I cancel my order after placing it?</h4>
                            <p>
                                Yes, orders can be cancelled before they are shipped. Once the
                                order has been dispatched, cancellation may not be possible.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What if I receive the wrong product?</h4>
                            <p>
                                If you receive an incorrect item, please contact our support
                                team immediately. We will arrange a replacement or refund after
                                verifying the issue.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>How do I raise a complaint about my order?</h4>
                            <p>
                                You can raise a complaint by contacting us through our Contact
                                Us page, email, or customer support number. Our team will review
                                your request and respond as soon as possible.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What if my order is delayed?</h4>
                            <p>
                                Sometimes delays may happen due to weather conditions, logistics
                                issues, or high order volume. If your order is delayed, please
                                contact our support team for assistance.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>How can I contact customer support?</h4>
                            <p>
                                You can reach our support team through email, phone, or the
                                contact form on our website. We aim to respond to all queries
                                within 24 hours.
                            </p>
                        </div>
                    </div>

                    <div id="sugar-faq" className={`faq-content ${activeTab === 'sugar-faq' ? 'active' : ''}`} style={{ display: activeTab === 'sugar-faq' ? 'block' : 'none' }}>
                        <div className="faq-item">
                            <h4>What is Cocofina Sugar?</h4>
                            <p>
                                Cocofina Sugar is a natural sweetener made from coconut nectar.
                                It is a healthier alternative to regular refined sugar and
                                retains natural minerals and nutrients from coconut sap.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>How is Cocofina Sugar made?</h4>
                            <p>
                                Cocofina Sugar is produced by collecting the nectar from coconut
                                palm flowers and gently heating it to form natural sugar
                                crystals. The process does not involve heavy chemical refining.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What is Cocofina Sugar?</h4>
                            <p>
                                Cocofina Sugar is a natural sweetener made from coconut nectar.
                                It is a healthier alternative to regular refined sugar and
                                retains natural minerals and nutrients from coconut sap.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Is Cocofina Sugar healthier than regular sugar?</h4>
                            <p>
                                Yes, Cocofina Sugar contains natural minerals like iron, zinc,
                                calcium, and potassium. It also has a lower glycemic index
                                compared to regular white sugar.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Can Cocofina Sugar be used in cooking and baking?</h4>
                            <p>
                                Yes. Cocofina Sugar can easily replace regular sugar in tea,
                                coffee, baking, desserts, and daily cooking.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Does Cocofina Sugar contain chemicals or preservatives?</h4>
                            <p>
                                No. Cocofina Sugar is 100% natural and free from artificial
                                chemicals, preservatives, or additives.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Is Cocofina Sugar suitable for diabetics?</h4>
                            <p>
                                Cocofina Sugar has a lower glycemic index compared to refined
                                sugar, but diabetics should always consult their doctor before
                                consuming any type of sugar.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>What does Cocofina Sugar taste like?</h4>
                            <p>
                                Cocofina Sugar has a mild caramel-like flavor which makes it
                                perfect for beverages, desserts, and traditional recipes.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>How should Cocofina Sugar be stored?</h4>
                            <p>
                                It should be stored in a cool and dry place in an airtight
                                container to maintain its freshness and quality.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Do you offer home delivery?</h4>
                            <p>
                                Yes, Cocofina Sugar is available for home delivery through our
                                website and selected online marketplaces.
                            </p>
                        </div>
                        <div className="faq-item">
                            <h4>Is Cocofina Sugar eco-friendly?</h4>
                            <p>
                                Yes. The production process of coconut sugar is environmentally
                                friendly and supports sustainable farming practices.
                            </p>
                        </div>
                    </div>

                    <div className="ask-question-container">
                        <h3>Ask Your Question</h3>
                        <form className="ask-form">
                            <div className="form-group full">
                                <input type="text" placeholder="Full Name" />
                            </div>
                            <div className="form-row">
                                <div className="form-group phone-group">
                                    <span className="prefix">+91-</span>
                                    <input type="text" placeholder="Phone Number" />
                                </div>
                                <div className="form-group">
                                    <input type="email" placeholder="Email Address" />
                                </div>
                            </div>
                            <div className="form-group full">
                                <textarea rows="4" placeholder="Type your question"></textarea>
                            </div>
                            <button type="submit" className="submit-btn">Submit</button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default FAQPage;