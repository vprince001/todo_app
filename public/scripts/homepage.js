const createListsHtml = function(myText) {
  let userData = JSON.parse(myText);

  let lists = userData.todoLists.map(
    details => "<p><a href=''>" + details.title + "</a></p>"
  );
  return lists.join("");
};

const removeCookie = function() {
  document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

const fetchData = function() {
  const listTitle = document.getElementById("addListBox").value;

  fetch("/addList", { method: "POST", body: listTitle })
    .then(data => data.text())
    .then(myText => createListsHtml(myText))
    .then(
      taggedListTitles =>
        (document.getElementById("TODOs").innerHTML = taggedListTitles)
    );
};
