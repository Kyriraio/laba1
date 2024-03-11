document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('add-button').addEventListener('click', ()=>{
    showModal('addModal')
  })
  populateNewsSection()
  document.getElementById('btn-submit-add').addEventListener('click', (e)=>{
    handleAddFormSubmit(e)
  })
  document.getElementById('btn-submit-update').addEventListener('click', (e)=>{
    handleUpdateFormSubmit(e)
  })
  document.getElementById('btn-submit-delete').addEventListener('click', (e)=>{
    handleDeleteFormSubmit(e)
  })
})
function getNewsItems() {
    let newsItems = JSON.parse(localStorage.getItem('newsItems')) || [];
    return newsItems;
  }
  
  // Function to save news items to localStorage
  function saveNewsItems(newsItems) {
    localStorage.setItem('newsItems', JSON.stringify(newsItems));
    populateNewsSection()
  }
  
  // Function to add a new news item
  function addNewsItem(date, content) {
    let newsItems = getNewsItems();
    let newItem = {
      date: date,
      content: content
    };
    newsItems.push(newItem);
    console.log(newsItems)
    saveNewsItems(newsItems);
  }
  
  // Function to delete a news item by index
  function deleteNewsItem(index) {
    let newsItems = getNewsItems();
    newsItems.splice(index, 1);
    saveNewsItems(newsItems);
  }
  
  // Function to update a news item by index
  function updateNewsItem(index, date, content) {
    let newsItems = getNewsItems();
    newsItems[index].date = date;
    newsItems[index].content = content;
    saveNewsItems(newsItems);
  }
  
  // Function to handle form submission for adding a news item
  function handleAddFormSubmit(event) {
    event.preventDefault();
    let dateInput = document.getElementById('date');
    let contentInput = document.getElementById('preview');
    let date = dateInput.value;
    let content = contentInput.value;
    addNewsItem(date, content);
    resetForm(dateInput, contentInput);
    hideModal('addModal')
  }
  
  // Function to handle form submission for updating a news item
  function handleUpdateFormSubmit(event) {
    event.preventDefault();
    let dateInput = document.getElementById('dateChange');
    let contentInput = document.getElementById('previewChange');
    let date = dateInput.value;
    let content = contentInput.value;
    let newsItemIndex = Number(document.getElementById('updateModal').dataset.index);
    updateNewsItem(newsItemIndex, date, content);
    resetForm(dateInput, contentInput);
    hideModal('updateModal');
  }
  
  // Function to handle form submission for deleting a news item
  function handleDeleteFormSubmit(event) {
    event.preventDefault();
    let newsItemIndex = Number(document.getElementById('deleteModal').dataset.index);
    deleteNewsItem(newsItemIndex);
    hideModal('deleteModal');
  }
  
  // Function to reset form inputs
  function resetForm(...inputs) {
    inputs.forEach(input => (input.value = ''));
  }
  
  // Function to show a modal
  function showModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.display = 'block';
  }
  
  // Function to hide a modal
  function hideModal(modalId) {
    let modal = document.getElementById(modalId);
    modal.style.display = 'none';
  }
  
  // Function to populate the news section with items from localStorage
  function populateNewsSection() {
    let newsItems = getNewsItems();
    let newsSection = document.querySelector('.news');
    newsSection.innerHTML = '';
  
    newsItems.forEach(function (item, index) {
      let newsItem = document.createElement('div');
      newsItem.classList.add('news-item');
  
      let dateContainer = document.createElement('div');
      dateContainer.classList.add('date');
      let dateHeading = document.createElement('h2');
      dateHeading.textContent = 'Дата';
      let dateParagraph = document.createElement('p');
      dateParagraph.textContent = item.date;
      dateContainer.appendChild(dateHeading);
      dateContainer.appendChild(dateParagraph);
  
      let content = document.createElement('div');
      content.classList.add('content');
      content.textContent = item.content;
  
      let deleteButton = document.createElement('button');
      deleteButton.textContent = 'Удалить';
      deleteButton.classList.add('btn-submit');
      deleteButton.addEventListener('click', function () {
        showDeleteModal(index);
      });
  
      let updateButton = document.createElement('button');
      updateButton.textContent = 'Изменить';
      updateButton.classList.add('btn-submit');
      updateButton.addEventListener('click', function () {
        showUpdateModal(index, item.date, item.content);
      });
  
      newsItem.appendChild(dateContainer);
      newsItem.appendChild(content);
      newsItem.appendChild(deleteButton);
      newsItem.appendChild(updateButton);
      newsSection.appendChild(newsItem);
    });
  }
  
  // Function to show the delete modal
  function showDeleteModal(index) {
    let deleteModal = document.getElementById('deleteModal');
    deleteModal.dataset.index = index;
    showModal('deleteModal');
  }
  
  // Function to show the update modal
  function showUpdateModal(index, date, content) {
    let updateModal = document.getElementById('updateModal');
    updateModal.dataset.index = index;
    let dateInput = document.getElementById('dateChange');
    let contentInput = document.getElementById('previewChange');
    dateInput.value = date;
    contentInput.value = content;
    showModal('updateModal');
  }
  
 