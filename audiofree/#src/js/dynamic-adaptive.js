// data-dynamic-adaptive="mediaType, mediaValue, new_parent, new_parent_is_unique" - ЗАПИСЬ ДЛЯ ПЕРЕМЕЩЕНИЯ
// data-insert-type="prepend/append" - ЗАПИСЬ ДЛЯ ТИПА ПЕРЕМЕЩЕНИЯ В НОВЫЙ БЛОК, если нет - то append

function dynamicAdaptive() {
    let objects = document.querySelectorAll('[data-dynamic-adaptive]');
    let objList = [];
    let mediaList = [];

    objects.forEach(obj => {
        let values = obj.dataset.dynamicAdaptive.split(', ');
        let mdType = values[0];
        if (!mdType) mdType = 'max';
        let mdValue = values[1];

        let media = `(${mdType}-width: ${mdValue}px)`;
        mediaList.push(media);

        let insertType = obj.dataset.insertType;
        if(!insertType) insertType = ['append', 'append'];
        else{
            insertType = insertType.split(', ');
            if(insertType.length == 1) insertType.push('append');
        }

        let objInfo = {};
        objInfo.obj = obj;
        objInfo.insertType = insertType;
        objInfo.media = media;
        objInfo.oldParent = obj.parentNode;
        objInfo.newParentClass = values[2];
        objInfo.isUnique = values[3];
        if(!values[3]) objInfo.isUnique = false;

        objList.push(objInfo);
    });

    mediaList = mediaList.filter((item, index, self) => {
        return self.indexOf(item) === index;
    });

    mediaList.forEach(mediaQueryText => {
        let mediaQuery = window.matchMedia(mediaQueryText);
        let objListMedia = objList.filter((item) => {
            return item.media == mediaQueryText;
        });

        doAdaptive(mediaQuery, objListMedia);
        mediaQuery.addEventListener('change', function (){
            doAdaptive(mediaQuery, objListMedia);
        }); 
    });

    function doAdaptive(mediaQuery, objListMedia) {

        objListMedia.forEach(obj => {
            if (mediaQuery.matches) {
                let newParent;
                if (obj.isUnique) newParent = document.querySelector(`.${obj.newParentClass}`);
                else {
                    newParent = obj.oldParent.querySelector(`.${obj.newParentClass}`);
                    let _newParent_ = obj.oldParent.parentNode;
                    while (!newParent) {
                        _newParent_ = _newParent_.parentNode;
                        newParent = _newParent_.querySelector(`.${obj.newParentClass}`);
                    }
                }
                switchAction(newParent, obj, obj.insertType[0]);
            }
            else {
                switchAction(obj.oldParent, obj, obj.insertType[1]);
            }
        })
    }
    function switchAction(parentType, obj, insertType) {
        switch (insertType) {
            case 'append':
                parentType.append(obj.obj);
                break;
            case 'prepend':
                parentType.prepend(obj.obj);
                break;
            default:
                parentType.append(obj.obj);
        }
    }
}

dynamicAdaptive();