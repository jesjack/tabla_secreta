class DataService {
    public static URL = 'https://koibanxchallenge-4030.restdb.io/rest/datos-comercios'

    public static count: number | undefined;
    public static async getCountData(): Promise<number> {
        if (this.count) {
            return this.count;
        }

        const q = {};
        const h = { $aggregate: ["COUNT:"] };

        const xmlHttp = new XMLHttpRequest();

        let p = new Promise<number>((resolve, reject) => {
            xmlHttp.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    DataService.count = JSON.parse(this.responseText)['COUNT '];
                    if (DataService.count === undefined) {
                        reject();
                        return;
                    }

                    resolve(DataService.count);
                }
            });
        });

        xmlHttp.open('GET', this.URL + '?q=' + JSON.stringify(q) + '&h=' + JSON.stringify(h));
        xmlHttp.setRequestHeader("content-type", "application/json");
        xmlHttp.setRequestHeader("x-apikey", "6447387039cf552ef728c3d2");
        xmlHttp.setRequestHeader("cache-control", "no-cache");
        xmlHttp.send(null);

        return p;
    }

    private static data: Array<{[column: string]: any}> = [];
    private static results: Array<{
        pageLength: number,
        page: number,
        data: Array<{[column: string]: any}>
    }> = [];
    public static async getData(pageLength: number, page: number): Promise<Array<{[column: string]: any}>> {
        const result = DataService.results.find(r => r.pageLength === pageLength && r.page === page);
        if (result) {
            return result.data;
        }

        const results: Array<{
            pageLength: 1,
            page: number,
            data: Array<{[column: string]: any}>
        }> = []; // results with { pageLength = 1, page = n and data = [length 1] }
        for (let i = 0; i < DataService.results.length; i++) {
            const result = DataService.results[i];
            for (let j = result.pageLength * (result.page - 1); j < result.pageLength * result.page; j++) {
                const data = result.data[j];
                if (data) {
                    results.push({
                        pageLength: 1,
                        page: j + 1,
                        data: [data]
                    });
                }
            }
        }

        const q = {};
        const max = pageLength;
        const skip = pageLength * (page - 1);
        // const sort = "ID"
        // const dir = 1;

        const xmlHttp = new XMLHttpRequest();

        let p = new Promise<Array<{[column: string]: any}>>((resolve, reject) => {
            xmlHttp.addEventListener("readystatechange", function () {
                if (this.readyState === 4) {
                    const data = JSON.parse(this.responseText);
                    if (!data || !data.length) {
                        reject();
                        return;
                    }

                    DataService.data.push(...data);
                    DataService.results.push({
                        pageLength,
                        page,
                        data
                    });

                    resolve(data);
                }
            });
        });

        xmlHttp.open('GET', this.URL + '?q=' + JSON.stringify(q) + '&max=' + max + '&skip=' + skip);
        xmlHttp.setRequestHeader("content-type", "application/json");
        xmlHttp.setRequestHeader("x-apikey", "6447387039cf552ef728c3d2");
        xmlHttp.setRequestHeader("cache-control", "no-cache");
        xmlHttp.send(null);

        return p;
    }
}

export default DataService;