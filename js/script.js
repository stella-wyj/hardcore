document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // File upload preview logic
document.getElementById("fileUpload").addEventListener("change", function () {
    const fileList = document.getElementById("fileList");
    fileList.innerHTML = "";
  
    Array.from(this.files).forEach(file => {
      const listItem = document.createElement("li");
      listItem.textContent = file.name;
      fileList.appendChild(listItem);
    });
  });
  