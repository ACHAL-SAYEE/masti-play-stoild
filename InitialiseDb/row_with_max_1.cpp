//{ Driver Code Starts
#include <bits/stdc++.h>
using namespace std;

// } Driver Code Ends
// User function template for C++
class Solution
{
public:
    int rowWithMax1s(vector<vector<int>> arr, int n, int m)
    {
        int i = 0, j = m - 1;
        int maxCount = 0, index = -1;

        while (j > 0 && arr[i][j] == 1)
        {
            j--;
        }
        maxCount = m - j - 1;
        if (maxCount > 0)
        {
            index = 0;
        }
        i++;
        while (i < n)
        {
            cout << "i: " << i << endl;
            int currCount = maxCount;
            if (j < 0)
                break;
            if (arr[i][j] == 0)
            {
                // i++;
                continue;
                cout << "123";
            }
            while (j >= 0 && arr[i][j] == 1)
            {
                currCount++;
                j--;
            }
            if (currCount > maxCount)
            {
                index = i;
            }
            cout<<"here"<<endl;
            i++;
        }
        return index;
    }
};

//{ Driver Code Starts.
int main()
{
    int t;
    cin >> t;
    while (t--)
    {
        int n, m;
        cin >> n >> m;
        vector<vector<int>> arr(n, vector<int>(m));
        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < m; j++)
            {
                cin >> arr[i][j];
            }
        }
        Solution ob;
        auto ans = ob.rowWithMax1s(arr, n, m);
        cout << ans << "\n";
    }
    return 0;
}

// } Driver Code Ends