<template>
  <div>
    <h1>Swap Creation</h1>

    <div>
      <label for="swapId">Swap ID:</label>
      <input type="text" id="swapId" v-model="swapId" />
    </div>

    <div>
      <label for="receiver">Receiver:</label>
      <input type="text" id="receiver" v-model="receiver" />
    </div>

    <div>
      <label for="tokenAddress">Token Address:</label>
      <input type="text" id="tokenAddress" v-model="tokenAddress" />
    </div>

    <div>
      <label for="amount">Amount:</label>
      <input type="number" id="amount" v-model="amount" />
    </div>

    <div>
      <label for="hashedSecret">Hashed Secret:</label>
      <input type="text" id="hashedSecret" v-model="hashedSecret" />
    </div>

    <div>
      <label for="lockTime">Lock Time:</label>
      <input type="number" id="lockTime" v-model="lockTime" />
    </div>

    <button @click="createSwap">Create Swap</button>

    <h1>Swap Execution</h1>

    <div>
      <label for="executionSwapId">Swap ID:</label>
      <input type="text" id="executionSwapId" v-model="executionSwapId" />
    </div>

    <div>
      <label for="secret">Secret:</label>
      <input type="text" id="secret" v-model="secret" />
    </div>

    <button @click="executeSwap">Execute Swap</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      swapId: '',
      receiver: '',
      tokenAddress: '',
      amount: '',
      hashedSecret: '',
      lockTime: '',
      executionSwapId: '',
      secret: ''
    };
  },
  methods: {
    async createSwap() {
      try {
        const response = await axios.post('/create-swap', {
          swapId: this.swapId,
          receiver: this.receiver,
          tokenAddress: this.tokenAddress,
          amount: this.amount,
          hashedSecret: this.hashedSecret,
          lockTime: this.lockTime
        });

        console.log('Swap created successfully:', response.data);
      } catch (error) {
        console.error('Error creating swap:', error);
      }
    },
    async executeSwap() {
      try {
        const response = await axios.post('/execute-swap', {
          executionSwapId: this.executionSwapId,
          secret: this.secret
        });

        console.log('Swap executed successfully:', response.data);
      } catch (error) {
        console.error('Error executing swap:', error);
      }
    }
  }
};
</script>