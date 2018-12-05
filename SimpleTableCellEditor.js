class SimpleTableCellEdition {

    constructor(elem) {

        this.Elem = elem;
        this.oldContent = $(elem).html();
        this.oldValue = $(elem).text();
    }

}

class SimpleTableCellEditor {

    constructor(_tableId, _params) {

        var _instance = this;

        if (typeof _tableId === 'undefined')
            _tableId = "table";

        this.tableId = _tableId; //Store the tableId (One CellEditor must be instantiated for each table)

        this.params = $.extend({}, _instance._GetDefaultEditorParams(), _params); //Load default params over given ones
        this.CellEdition = null; //CellEdition contains the current edited cell


        //Handle click outside table to end edition
        $(document).mouseup(function (e) {

            var container = $(`#${_instance.tableId}`);

            if (!container.is(e.target) && container.has(e.target).length === 0) {
                _instance._FreeCurrentCell();
            }
        });
    }

    SetEditableClass(editableClass, _cellParams) {

        var _instance = this;

        var cellParams = $.extend({}, _instance._GetDefaultCellParams(), _cellParams);

        //If click on td (not already in edit ones)
        $(`#${this.tableId}`).on('click', `td.${editableClass}:not(.${_instance.params.inEditClass})`, function () {
            _instance._EditCell(this, cellParams);
        });


        $(`#${this.tableId}`).on('keydown', `td.${editableClass}.${_instance.params.inEditClass}`, function (event) {

            if (event.which === 13)
                _instance._EndEditCell(this, cellParams);
            else if (event.which === 27)
                _instance._AbortEditCell(this, cellParams);
        });

    }


    _EditCell(elem, cellParams) {

        this._FreeCurrentCell(cellParams);

        this.CellEdition = new SimpleTableCellEdition(elem);

        var content = $(elem).text();
        $(elem).addClass(this.params.inEditClass);
        $(elem).html(`<input type='text' style="width:100%; max-width:none">`);

        var input = $(elem).find('input');
        input.focus();
        input.val(content);
    }

    _EndEditCell(elem, cellParams) {
        this._FreeCell(elem, cellParams, true);
    }

    _AbortEditCell(elem, cellParams) {
        this._FreeCell(elem, cellParams, false);
    }

    _FreeCell(elem, cellParams, keepChanges) {

        if (typeof $(elem).length === 'undefined' || $(elem).length === 0 || this.CellEdition === null)
            return;

        var newVal = $(elem).find('input').val();

        $(elem).removeClass(this.params.inEditClass);
        $(elem).html('');

        //if validation method return false for new value
        if (!cellParams.validation(newVal))
            keepChanges = false;

        if (keepChanges)
            $(elem).text(newVal);
        else
            $(elem).html(this.CellEdition.oldContent);


        if (keepChanges) {

            //Trigger custom event
            $(`#${this.tableId}`).trigger({
                type: "cell:edited",
                element: elem,
                newValue: newVal,
                oldValue: this.CellEdition.oldValue
            });

        }

        this.CellEdition = null;
    }

    _FreeCurrentCell() {

        this._EndEditCell(this._GetCurrentCell());
    }

    _GetCurrentCell() {

        return (this.CellEdition === null ? null : this.CellEdition.Elem);
    }

    _GetDefaultEditorParams() {

        return {
            inEditClass: "inEdit" //class used to flag cell in edit mode
        };
    }

    _GetDefaultCellParams() {

        return {
            validation: (value) => { return true; } //method used to validate new value
        };

    }

}