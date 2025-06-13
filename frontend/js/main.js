document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const chatSnippetInput = document.getElementById('chat-snippet');
    const toneSelector = document.getElementById('tone-selector');
    const generateBtn = document.getElementById('generate-btn');
    const loadingIndicator = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const resultsContainer = document.getElementById('results-container');
    const repliesList = document.getElementById('replies-list');

    // API endpoint (adjust if needed)
    const API_URL = 'http://localhost:3000/api/generate';

    // Event listeners
    generateBtn.addEventListener('click', generateReplies);

    /**
     * Generate reply suggestions
     */
    async function generateReplies() {
        const snippet = chatSnippetInput.value.trim();
        const tone = toneSelector.value;

        // Validate input
        if (!snippet) {
            showError('Please enter a chat snippet');
            return;
        }

        // Show loading, hide other sections
        loadingIndicator.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        generateBtn.disabled = true;

        try {
            // Call API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ snippet, tone })
            });

            // Check for errors
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate replies');
            }

            // Process results
            const data = await response.json();
            displayReplies(data.replies);

        } catch (error) {
            showError(error.message || 'Something went wrong');
        } finally {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
        }
    }

    /**
     * Display generated replies
     */
    function displayReplies(replies) {
        // Clear previous results
        repliesList.innerHTML = '';

        // Check if we have replies
        if (!replies || replies.length === 0) {
            showError('No replies were generated. Please try again.');
            return;
        }

        // Create reply cards
        replies.forEach((reply, index) => {
            const replyCard = document.createElement('div');
            replyCard.className = 'reply-card p-4 border rounded-lg hover:shadow-md';
            replyCard.innerHTML = `
                <div class="flex justify-between">
                    <span class="text-purple-600 font-medium">Option ${index + 1}</span>
                    <button class="copy-btn text-sm text-gray-500 hover:text-purple-600" data-reply="${escapeHTML(reply)}">
                        Copy
                    </button>
                </div>
                <p class="mt-2 text-gray-800">${escapeHTML(reply)}</p>
            `;

            repliesList.appendChild(replyCard);
        });

        // Show results container
        resultsContainer.classList.remove('hidden');

        // Add copy functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const replyText = e.target.getAttribute('data-reply');
                copyToClipboard(replyText, e.target);
            });
        });
    }

    /**
     * Copy text to clipboard
     */
    function copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            // Update button text temporarily
            const originalText = buttonElement.textContent;
            buttonElement.textContent = 'Copied!';
            buttonElement.parentElement.parentElement.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.parentElement.parentElement.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    /**
     * Show error message
     */
    function showError(message) {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});