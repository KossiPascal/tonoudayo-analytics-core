export class Sort {
    private sortOrder = 1;
    private collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
    });

    constructor() { }

    public startSort(property: any, order: any, type = "") {
        if (order === "desc") {
            this.sortOrder = -1;
        }
        return (a: any, b: any) => {
            if (type === "date") {
                return this.sortData(new Date(a[property]), new Date(b[property]));
            } else {

                var json:any[] = property.split('.');
                if (json.length > 1) {
                    if (json.length==2) {
                        return this.collator.compare(a[json[0]][json[1]], b[json[0]][json[1]]) * this.sortOrder;
                    } else if (json.length==3) {
                        return this.collator.compare(a[json[0]][json[1]][json[2]], b[json[0]][json[1]][json[2]]) * this.sortOrder;
                    } else if (json.length==4) {
                        return this.collator.compare(a[json[0]][json[1]][json[2]][json[3]], b[json[0]][json[1]][json[2]][json[3]]) * this.sortOrder;
                    } else if (json.length==5) {
                        return this.collator.compare(a[json[0]][json[1]][json[2]][json[3]][json[4]], b[json[0]][json[1]][json[2]][json[3]][json[4]]) * this.sortOrder;
                    }
                }

                return this.collator.compare(a[property], b[property]) * this.sortOrder;
            }
        }
    }


    private sortData(a: any, b: any) {
        if (a < b) {
            return -1 * this.sortOrder;
        } else if (a > b) {
            return 1 * this.sortOrder;
        } else {
            return 0 * this.sortOrder;
        }
    }

}