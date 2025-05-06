document.addEventListener('DOMContentLoaded', function() {

    console.log("DOM fully loaded and parsed");

    const dataUrl = 'data/my_data.json';
    let fullChartData = []; // Store the original full dataset
    let currentChartInstance = null; // Store the chart instance

    // --- Get DOM elements ---
    const categoryFilterSelect = document.getElementById('categoryFilter');
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    const chartCanvas = document.getElementById('myBarChart'); // Get canvas directly
    const chartContext = chartCanvas.getContext('2d'); // Get context

    // --- Function to populate filter options ---
    function populateFilterOptions(data) {
        if (!data || data.length === 0) return;

        // Get unique categories using Set
        const categories = [...new Set(data.map(item => item.category))];
        console.log("Unique categories found:", categories);

        // Clear existing options except the first one ("Show All")
        categoryFilterSelect.innerHTML = '<option value="all">Show All</option>';

        // Add options for each unique category
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilterSelect.appendChild(option);
        });
    }

    // --- Function to create or update the chart ---
    function displayChart(data) {
        console.log("Displaying chart with data:", data);

        if (!data) { // Handle case where data might be undefined
            console.warn("No data provided to displayChart");
            // Maybe display a message in the chart area
             if (currentChartInstance) { currentChartInstance.destroy(); currentChartInstance = null; } // Clear old chart
             chartContext.clearRect(0, 0, chartCanvas.width, chartCanvas.height); // Clear canvas
             chartContext.textAlign = 'center';
             chartContext.fillText('No data to display for this filter.', chartCanvas.width / 2, 50);
            return;
        }
         if (data.length === 0) { // Handle empty filtered data
             console.warn("Empty dataset provided to displayChart after filtering");
              if (currentChartInstance) { currentChartInstance.destroy(); currentChartInstance = null; }
              chartContext.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
              chartContext.fillText('No data matches the selected filter.', chartCanvas.width / 2, 50);
              return;
         }


        // Prepare labels and data points
        const labels = data.map(item => item.month);
        const visitCounts = data.map(item => item.visits);

        // Destroy previous chart instance if it exists
        if (currentChartInstance) {
            currentChartInstance.destroy();
        }

        // Create the new chart
        // Inside the displayChart function...
        currentChartInstance = new Chart(chartContext, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monthly Visits',
                    data: visitCounts,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Number of Visits' }
                    },
                    x: {
                        title: { display: true, text: 'Month' }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Website Visits per Month',
                        font: { // Example: Customize title font
                            size: 18
                        },
                        padding: {
                            top: 10,
                            bottom: 20 // More space below title
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { // Example: Customize legend labels
                            boxWidth: 12,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: { // Example: Customize tooltips
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Darker tooltip
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 10,
                        displayColors: false, // Hide the little color box in tooltip
                        callbacks: { // Example: Customize tooltip text
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // Format number with commas if needed
                                    // label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                                    label += context.parsed.y; // Keep it simple for now
                                }
                                return label;
                            }
                        }
                    }
                },
                // Example: Add hover effects
                hover: {
                    mode: 'index', // Highlight items in the same category on X axis
                    intersect: false
                },
                interaction: { // Alternative way to define hover/tooltip behavior
                    mode: 'index',
                    intersect: false,
                },
                // Example: Add basic animation
                animation: {
                    duration: 800, // Animation duration in ms
                    easing: 'easeOutQuart' // Animation easing effect
                }
            } // End options
        }); // End new Chart
        console.log("Chart created/updated.");
    }

    // --- Function to filter data and update chart ---
    function filterAndDisplayChart() {
        const selectedCategory = categoryFilterSelect.value;
        console.log("Filter changed to:", selectedCategory);

        let filteredData;

        if (selectedCategory === 'all') {
            filteredData = fullChartData; // Use the full dataset
        } else {
            // Filter the full dataset based on the selected category
            filteredData = fullChartData.filter(item => item.category === selectedCategory);
        }

        displayChart(filteredData); // Update the chart with filtered data
    }


    // --- Function to fetch and process initial data ---
    async function loadData() {
        try {
            console.log("Fetching data from:", dataUrl);
            const response = await fetch(dataUrl);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            console.log("Data fetched successfully, parsing JSON...");
            const data = await response.json();
            console.log("Data parsed successfully:", data);

            fullChartData = data; // Store the full dataset

            // --- Initial Setup ---
            populateFilterOptions(fullChartData); // Populate dropdown
            displayChart(fullChartData); // Display the initial chart with all data

            // --- Add Event Listeners ---
            categoryFilterSelect.addEventListener('change', filterAndDisplayChart);
            resetFilterBtn.addEventListener('click', () => {
                categoryFilterSelect.value = 'all'; // Reset dropdown
                filterAndDisplayChart(); // Re-filter/display all
            });


        } catch (error) {
            console.error("Error loading or parsing data:", error);
            const chartContainer = document.getElementById('chart-container');
            if(chartContainer) {
                chartContainer.innerHTML = `<p style="color: red;">Error loading data: ${error.message}. Please check the console.</p>`;
            }
        }
    }

    // --- Start loading the data ---
    loadData();

}); // End of DOMContentLoaded