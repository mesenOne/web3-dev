import express, { json } from 'express';
import Web3 from 'web3';
import contractABI from './HashedTimeLockABI.json'; // 导入智能合约ABI
import ERC20ABI from './ERC20ABI.json'; // 导入代币合约ABI

const app = express();
app.use(json());

// 创建Web3实例
const web3 = new Web3('https://goerli.infura.io/v3/9ffd21aefae04e2f85cda0c1415b7d06');

// 加载智能合约
const contractAddress = '<智能合约地址>'; // 替换为实际的智能合约地址
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 创建交换
app.post('/createSwap', async (req, res) => {
  try {
    const { swapId, receiver, tokenAddress, amount, hashedSecret, lockTime } = req.body;
    const accounts = await web3.eth.getAccounts();

    let options = { value: web3.utils.toWei(amount.toString()) };
    if (tokenAddress !== '0x0') {
      options = {
        from: accounts[0],
        value: 0,
        gas: 3000000
      };
      const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
      await token.methods.approve(contractAddress, amount).send({ from: accounts[0] });
    }

    await contract.methods.createSwap(swapId, receiver, tokenAddress, amount, hashedSecret, lockTime)
      .send(options)
      .on('transactionHash', (hash) => {
        console.log('Transaction hash:', hash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
      })
      .on('error', (error) => {
        console.error('Error creating swap:', error);
      });

    res.status(200).json({ message: 'Swap created successfully' });
  } catch (error) {
    console.error('Error creating swap:', error);
    res.status(500).json({ error: 'Error creating swap' });
  }
});

// 执行交换
app.post('/executeSwap', async (req, res) => {
  try {
    const { swapId, secret } = req.body;
    const accounts = await web3.eth.getAccounts();
    
    await contract.methods.executeSwap(swapId, secret)
      .send({ from: accounts[0], gas: 3000000 })
      .on('transactionHash', (hash) => {
        console.log('Transaction hash:', hash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
      })
      .on('error', (error) => {
        console.error('Error executing swap:', error);
      });

    res.status(200).json({ message: 'Swap executed successfully' });
  } catch (error) {
    console.error('Error executing swap:', error);
    res.status(500).json({ error: 'Error executing swap' });
  }
});

// 获取代币余额
app.get('/getTokenBalance/:tokenAddress', async (req, res) => {
  try {
    const { tokenAddress } = req.params;

    if (tokenAddress === '0x0') {
      const balance = await web3.eth.getBalance(contractAddress);
      res.status(200).json({ balance });
    } else {
      const token = new web3.eth.Contract(ERC20ABI, tokenAddress);
      const balance = await token.methods.balanceOf(contractAddress).call();
      res.status(200).json({ balance });
    }
  } catch (error) {
    console.error('Error getting token balance:', error);
    res.status(500).json({ error: 'Error getting token balance' });
  }
});

// 揭示密钥
app.post('/revealSecret', async (req, res) => {
  try {
    const { swapId, secret } = req.body;
    const accounts = await web3.eth.getAccounts();

    await contract.methods.revealSecret(swapId, secret)
      .send({ from: accounts[0], gas: 3000000 })
      .on('transactionHash', (hash) => {
        console.log('Transaction hash:', hash);
      })
      .on('receipt', (receipt) => {
        console.log('Transaction receipt:', receipt);
      })
      .on('error', (error) => {
        console.error('Error revealing secret:', error);
      });

    res.status(200).json({ message: 'Secret revealed successfully' });
  } catch (error) {
    console.error('Error revealing secret:', error);
    res.status(500).json({ error: 'Error revealing secret' });
  }
});

// 启动服务器
const port = 3000; // 替换为实际的端口号
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});