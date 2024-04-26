<template>
  <div id="app">
    <LogViewer :logs="logs" :sortBy="sortBy" :isFlipped="isFlipped" @sortBy="sortBy = $event" @flipSort="flipSort" @addItem="addItem" />
  </div>
</template>

<script>
import { ref } from 'vue';
import LogViewer from '../components/LogViewer.vue'; // Import LogViewer component
// import { addItemToTable } from '../main.ts'; // Import the addItemToTable function


// Define logs ref
const logs = ref([]);

// Define deleteLog function
const deleteLog = () => {
  logs.value = []; // Clear logs array
};

// Expose deleteLog globally
window.deleteLog = deleteLog;

// Define addLog function
const addLog = (log) => {
    logs.value.push(log); // Push received log to logs array
};
// Expose addLog globally
window.addLog = addLog;


export default {
  components: {
    LogViewer // Register LogViewer component
  },
  setup() {
    const url = import.meta.env.VITE_BASE_URL; // Get the API URL from the environment variables
    const socket = new WebSocket("wss://aetdm1alc2.execute-api.eu-north-1.amazonaws.com/dev"); // Create a new WebSocket connection
    const messages = ref([]);

    // Event listeners for WebSocket events
    socket.onopen = () => {
      console.log('WebSocket connection established.');
    };

    const sortBy = ref('timestamp'); // Default sorting by timestamp
    const isFlipped = ref(false); // Default sorting order

    const flipSort = () => {
      isFlipped.value = !isFlipped.value;
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const timestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Get local time in the format dd/mm/yyyy hh:mm:ss
      console.log('metric: ', data.metric.S);
      addLog({ id: data.id.S, timestamp: timestamp, message: data.message.S, metric: data.metric.S });
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };
    return { socket, messages, logs, sortBy, isFlipped, flipSort };
  },
  methods: {
    sendMessage() {
      this.socket.send('Hello, WebSocket!'); // Send message to WebSocket server
    }
  }
};
</script>
