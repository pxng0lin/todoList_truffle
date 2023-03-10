App = {
  loading: false,
  contracts: {},


  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
    //console.log("app loading...")
  },
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
    console.log(App.account)
  },

  loadContract: async () => {
    const todoList = await $.getJSON("ToDoList.json")
    // console.log(todoList)
    App.contracts.ToDoList = TruffleContract(todoList)
    App.contracts.ToDoList.setProvider(App.web3Provider)

    App.todoList = await App.contracts.ToDoList.deployed()

  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }
    // Update app loading state
    App.setLoading(true)

    // Render account
    $('#account').html(App.account)

    // Render tasks
    await App.renderTasks()

    App.setLoading(false)
  },

  renderTasks: async () => {
    //taskTemplate, checkbox and content
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    // we do this using the taskCount, this is accomplished using a for loop
    for (var i = 1; i <= taskCount; i++) {
      const task = await App.todoList.tasks(i) // this returns an array so we use 0 indexing to pull each attribute from tasks
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]

      // create the HTML for the tasks, taken from the DOM
      const $newTaskTemplate = $taskTemplate.clone() // cloned
      $newTaskTemplate.find('.content').html(taskContent)
      $newTaskTemplate.find('input')
        .prop('name', taskId)
        .prop('checked', taskCompleted)
        .on('click', App.toggleCompleted)

      // put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }



      // Show task
      $newTaskTemplate.show()
    }
  },


  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val() // this is the name of the input on the form, id="newTask"
    // Call the smart contract function
    await App.todoList.createTask(content)
    // refresh the page, fethcing all the tasks from the blockchain, rather than listening for the event from the page
    window.location.reload()
  },

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name // is an onclick event
    await App.todoList.toggleCompleted(taskId) // calling the smart contract now and supplying the taskId
    window.location.reload() // just reloads the webpage
  },

  // setLoading function
  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader') // this is found in the html file, showing on the site as Loading...
    const content = $('#content') // this is found in the html file, this is the todo list that shows on the page
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})