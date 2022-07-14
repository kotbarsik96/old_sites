function renderFilterLists() {
    const featuresArray = getArray('features');
    const featuresObj = { title: 'По содержимому', keyName: 'features', content: featuresArray };
    filterLists.push(featuresObj);
}
function getArray(keyName) {
    const list = [];
    worksSrc.forEach(work => {
        work[keyName].forEach(elem => {
            if (list.indexOf(elem) < 0) list.push(elem);
        });
    });
    return list;
}
function renderFilterStrings() {
    const platformsArray = [{ name: 'Мобильная', value: false }, { name: 'ПК', value: true }];
    const platformsObj = { title: 'По платформе', keyName: 'isDesktop', content: platformsArray };
    filterStrings.push(platformsObj);
}