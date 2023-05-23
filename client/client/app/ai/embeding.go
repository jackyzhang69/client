package ai

import (
	"app/noc"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	cohere "github.com/cohere-ai/cohere-go"
)

func Embedding() ([][]float64, bool) {
	co, err := cohere.CreateClient("T4egg1ZFJqlP0bXLuflPKbMWknRWrrdV0H7sHH71")
	if err != nil {
		fmt.Println(err)
		return [][]float64{}, false
	}
	noc.Load_data()
	noc21311 := noc.CONTENT["21311"]
	response, err := co.Embed(cohere.EmbedOptions{
		Model: "small",
		Texts: noc21311.TitleExamples,
	})
	if err != nil {
		fmt.Println(err)
		return [][]float64{}, false
	}

	fmt.Println("Embeddings:", response.Embeddings)

	return response.Embeddings, true
}

// store embedding in Pinecone
func CreateIndex(index_name string) {
	url := "https://controller.us-east4-gcp.pinecone.io/databases"
	playload_string := fmt.Sprintf(`{"metric":"cosine","pods":1,"replicas":1,"pod_type":"p1.x1","dimension":1024,"name":"%s"}`, index_name)
	payload := strings.NewReader(playload_string)

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("accept", "text/plain")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("Api-Key", "03754c1d-0a43-4489-946e-d77d90ccf398")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))
}

func Get() {
	url := "https://controller.us-east4-gcp.pinecone.io/databases"
	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("accept", "application/json; charset=utf-8")
	req.Header.Add("Api-Key", "03754c1d-0a43-4489-946e-d77d90ccf398")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(res.StatusCode)
	fmt.Println(string(body))

}

// upsert embedding in Pinecone
func Upsert(id string, values []float64) {
	indexName := "noc2021v1"
	projectID := "973adad"
	environment := "us-east4-gcp"
	url := fmt.Sprintf("https://%s-%s.svc.%s.pinecone.io/vectors/upsert", indexName, projectID, environment)

	valuesStr := strings.Trim(strings.Join(strings.Fields(fmt.Sprint(values)), ","), "[]")

	payloadString := fmt.Sprintf(`{"vectors":[{"values":[%v],"metadata":{"code":"%s"},"id":"%s"}]}`, valuesStr, id, id)
	payload := strings.NewReader(payloadString)

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("accept", "application/json")
	req.Header.Add("content-type", "application/json")
	req.Header.Add("Api-Key", "03754c1d-0a43-4489-946e-d77d90ccf398")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()
	body, _ := ioutil.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))
}
