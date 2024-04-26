<template>
  <div class="log-viewer">
    <h2 class="log-title">Log Table</h2>

    <table class="log-table">
      <thead>
        <tr>
          <th id="timestamp" @click="sortByColumn('timestamp')">Timestamp {{ (sortBy === 'timestamp'  ?  (isFlipped ? ' ↑' : ' ↓') : '  ') }}</th>
          <th id="id" @click="sortByColumn('id')">ID {{ (sortBy === 'id'  ?  (isFlipped ? ' ↑' : ' ↓') : '  ') }}</th>
          <th id="message" @click="sortByColumn('message')">Message {{ (sortBy === 'message'  ?  (isFlipped ? ' ↑' : ' ↓') : '  ') }}</th>
          <th id="metric" @click="sortByColumn('metric')">Metric {{ (sortBy === 'metric'  ?  (isFlipped ? ' ↑' : ' ↓') : '  ') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in sortedLogs" :key="log.id" class="logger">
          <td>{{ log.timestamp }}</td>
          <td>{{ log.id }}</td>
          <td>{{ log.message }}</td>
          <td v-if="log.metric">{{ log.metric }}</td>
          <td v-else>< empty ></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    logs: {
      type: Array,
      required: true
    },
    sortBy: {
      type: String,
      required: true
    },
    isFlipped: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      newLog: {
        timestamp: '',
        id: '',
        message: '',
        metric: ''
      }
    };
  },
  computed: {
    sortedLogs() {
      return this.logs.slice().sort((a, b) => {
        // Sort by the selected criteria
        let retList;
        switch (this.sortBy) {
          case 'timestamp':
            retList = a.timestamp.localeCompare(b.timestamp);
            break;
          case 'id':
            retList = a.id.localeCompare(b.id);
            break;
          case 'message':
            retList = a.message.localeCompare(b.message);
            break;
          case 'metric':
            retList = a.metric.localeCompare(b.metric);
            break;
          default:
            // Default sorting by timestamp
            retList = a.timestamp.localeCompare(b.timestamp);
            break;
        }
        if (this.isFlipped) {
          return -retList; // Invert the sorting order
        } else {
          return retList;
        }
      });
    }
  },
  methods: {
    sortByColumn(column) {
      // Emit event to update sorting criteria
      if (column === this.sortBy) {
        this.$emit('flipSort');
      } else if (this.isFlipped) {
        this.$emit('flipSort');
      }
      this.$emit('sortBy', column);
    },
    addItem() {

      // Emit event to add the new item
      this.$emit('addItem', this.newLog);

      // Clear the form fields
      this.newLog.timestamp = '';
      this.newLog.id = '';
      this.newLog.message = '';
      this.newLog.metric = '';
    }
  }
};
</script>

<style scoped>
.log-viewer {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.log-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
}
.log-table th,
.log-table td {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  width: 25%;
  
}

.log-table th {
  font-weight: bold;
  text-align: left;
  cursor: pointer;
  background-color: #ddd;
  
}
.log-table td {
  padding: 10px;
  border-bottom: 1px solid #ccc;
  height: 30px;
  overflow-x: auto; /* Enable horizontal scrolling */
  overflow-y: auto; /* Enable vertical scrolling */
  white-space: nowrap; /* Prevent text wrapping */
}

form {
  margin-top: 20px;
}

label {
  margin-bottom: 5px;
}

input[type="text"] {
  width: 10%;
}
</style>
