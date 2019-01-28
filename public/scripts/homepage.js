const removeCookie = function() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

const fetchData = function() {
  const listTitle = document.getElementById("addListBox").value;

  fetch("/addList", { method: "POST", body: listTitle })
    .then(data => data.text())
    .then(myText => (document.getElementById("TODOs").innerText = myText));
};
