
        async function fetchRequestsByHour() {
            try {
                // Fetch data from the backend
                const response = await fetch('http://localhost:3000/requests-by-hour');
                const data = await response.json();

                // Extract labels (hours) and dataset (request counts)
                const labels = data.map(item => `${item.hour_of_day}:00`);
                const requestCounts = data.map(item => item.request_count);

                // Chart configuration
                const chartData = {
                    labels: labels,
                    datasets: [{
                        label: 'Number of Requests',
                        data: requestCounts,
                        backgroundColor: 'rgba(255, 99, 132, 1)', // Light blue background
                        borderColor: '#003049', // Blue border
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)', // Red points
                        pointRadius: 5,
                        tension: 0.4 // Smooth line
                    }]
                };

                const config = {
                    type: 'line',
                    data: chartData,
                    options: {
                        responsive: true,
                        plugins: {
                            tooltip: {
                                enabled: true,
                                callbacks: {
                                    label: function (context) {
                                        return `${context.dataset.label}: ${context.raw}`;
                                    }
                                }
                            },
                            legend: {
                                display: true,
                                labels: {
                                    color: '#333',
                                    font: {
                                        size: 14
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Time of Day (Hours)',
                                    color: '#666',
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.3)',
                                    borderDash: [5, 5]
                                }
                            },
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Requests',
                                    color: '#666',
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.3)',
                                    borderDash: [5, 5]
                                }
                            }
                        }
                    }
                };

                // Render the chart
                const ctx = document.getElementById('requestsByHourChart').getContext('2d');
                new Chart(ctx, config);
            } catch (error) {
                console.error('Error fetching requests by hour:', error);
            }
        }

        // Fetch and render the graph on page load
        fetchRequestsByHour();
  


        async function fetchConnectedUsers() {
            try {
                // Fetch data from the backend
                const response = await fetch('http://localhost:3000/connected-users');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Update the DOM with the user count
                const userCountElement = document.getElementById('userCount');
                userCountElement.textContent = data.total_users;
            } catch (error) {
                console.error('Error fetching connected users:', error);
            }
        }
        async function fecthTodaysRequests() {
            try {
                // Fetch data from the backend
                const response = await fetch('http://localhost:3000/requests-today');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();

                // Update the DOM with the user count
                const userCountElement = document.getElementById('requestCount');
                userCountElement.textContent = data.total_requests;
            } catch (error) {
                console.error('Error fetching connected users:', error);
            }
        }


        // Fetch the data when the page loads
        fetchConnectedUsers();
        fecthTodaysRequests();